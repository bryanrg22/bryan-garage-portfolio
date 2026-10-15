import { expect, test, type Page } from '@playwright/test'

// End-to-end smoke test of the real production bundle (`vite preview` of
// dist/) in Chromium. CI runners have no GPU, so WebGL runs on SwiftShader:
// slow, but it renders the actual scene. Forces the HIGH tier so every model
// — decoratives, car lift, GTR — is loaded and compiled.

// Tabs that open a side panel (Home just closes; Music is a Spotify iframe).
const PANEL_TABS = ['Work', 'Projects', 'Skills', 'Edu', 'Awards', 'Hacks', 'Cultura', 'Soccer', 'Brea', 'Origin']

function watchForProblems(page: Page) {
  const problems: string[] = []
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console error: ${m.text()}`) })
  page.on('response', (r) => {
    const url = new URL(r.url())
    // Same-origin only; /_vercel/* only exists on Vercel, not `vite preview`.
    if (url.hostname === 'localhost' && !url.pathname.startsWith('/_vercel/') && r.status() >= 400) {
      problems.push(`HTTP ${r.status()} ${url.pathname}`)
    }
  })
  page.on('requestfailed', (r) => {
    const url = new URL(r.url())
    if (url.hostname === 'localhost') problems.push(`request failed: ${url.pathname} (${r.failure()?.errorText})`)
  })
  return problems
}

test.beforeEach(async ({ page }) => {
  // Never send CI traffic to real analytics. Answer with empty stubs rather
  // than aborting — aborted requests surface as console errors and would fail
  // the zero-errors assertion for reasons that have nothing to do with the site.
  await page.route(/posthog\.com/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }))
  await page.route(/\/_vercel\/(insights|speed-insights)\//, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }))
})

test('garage loads every model, renders a non-blank scene, and every panel opens', async ({ page }, testInfo) => {
  const problems = watchForProblems(page)
  const models = new Set<string>()
  page.on('response', (r) => { if (r.url().includes('/models/') && r.ok()) models.add(new URL(r.url()).pathname) })

  await page.goto('/?tier=high')
  // Loading screen only drops once every asset is downloaded AND every shader
  // is compiled (ShaderWarmup) — so this is the "scene is fully ready" signal.
  await expect(page.getByText('Opening the garage door')).toBeHidden({ timeout: 150_000 })
  await expect(page.locator('canvas')).toBeVisible()

  // HIGH tier loads all decorative + heavy models (28 at time of writing).
  expect(models.size, `models loaded: ${[...models].join(', ')}`).toBeGreaterThanOrEqual(25)

  // Let the garage door finish rolling up, then prove the canvas actually has
  // a picture in it (a render bug that draws nothing still "loads" fine).
  await page.waitForTimeout(5000)
  const shot = await page.screenshot()
  await testInfo.attach('home-view', { body: shot, contentType: 'image/png' })
  const stddev = await page.evaluate(async (b64) => {
    const img = new Image()
    img.src = `data:image/png;base64,${b64}`
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.width; c.height = img.height
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    // Sample the middle of the frame (the 3D scene, away from the UI chrome).
    const { data } = ctx.getImageData(img.width * 0.2, img.height * 0.25, img.width * 0.6, img.height * 0.5)
    let sum = 0, sumSq = 0, n = 0
    for (let i = 0; i < data.length; i += 16) {
      const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      sum += l; sumSq += l * l; n++
    }
    const mean = sum / n
    return Math.sqrt(sumSq / n - mean * mean)
  }, shot.toString('base64'))
  expect(stddev, 'scene looks blank (uniform color) — nothing rendered').toBeGreaterThan(12)

  for (const tab of PANEL_TABS) {
    await page.getByRole('button', { name: tab, exact: true }).click()
    await expect(page.getByRole('button', { name: /back to garage/i }), `${tab} panel did not open`).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: /back to garage/i }).click()
    await expect(page.getByRole('button', { name: /back to garage/i })).toBeHidden({ timeout: 20_000 })
  }

  expect(problems, problems.join('\n')).toEqual([])
})
