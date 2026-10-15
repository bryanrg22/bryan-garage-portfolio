import { expect, test, type Page } from '@playwright/test'
import { PNG } from 'pngjs'

// End-to-end smoke tests of the real production bundle (`vite preview` of
// dist/) in Chromium. CI runners have no GPU, so WebGL runs on SwiftShader —
// a full HIGH-tier frame can take seconds there. So the work is split:
//   1. HIGH tier: every model downloads, compiles, and the frame isn't blank.
//   2. LOW tier:  every tab panel opens and closes (UI logic is tier-independent,
//                 and LOW renders several times faster in software).

// Tabs that open a side panel (Home just closes; Music is a Spotify iframe).
const PANEL_TABS = ['Work', 'Projects', 'Skills', 'Edu', 'Awards', 'Hacks', 'Cultura', 'Soccer', 'Brea', 'Origin']

test.describe.configure({ timeout: 8 * 60_000 })

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

/** Luminance standard deviation of the middle of a PNG — ~0 for a blank frame. */
function centerStdDev(png: Buffer) {
  const img = PNG.sync.read(png)
  const x0 = Math.floor(img.width * 0.2), x1 = Math.floor(img.width * 0.8)
  const y0 = Math.floor(img.height * 0.25), y1 = Math.floor(img.height * 0.75)
  let sum = 0, sumSq = 0, n = 0
  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = (y * img.width + x) * 4
      const l = 0.299 * img.data[i] + 0.587 * img.data[i + 1] + 0.114 * img.data[i + 2]
      sum += l; sumSq += l * l; n++
    }
  }
  const mean = sum / n
  return Math.sqrt(sumSq / n - mean * mean)
}

test.beforeEach(async ({ page }) => {
  // Never send CI traffic to real analytics. Answer with empty stubs rather
  // than aborting — aborted requests surface as console errors and would fail
  // the zero-errors assertion for reasons that have nothing to do with the site.
  await page.route(/posthog\.com/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }))
  await page.route(/\/_vercel\/(insights|speed-insights)\//, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }))
})

test('HIGH tier: every model loads and compiles, and the scene renders', async ({ page }, testInfo) => {
  // Smaller viewport: SwiftShader cost scales with pixels; this test is about
  // assets and rendering, not layout.
  await page.setViewportSize({ width: 960, height: 600 })
  const problems = watchForProblems(page)
  const models = new Set<string>()
  page.on('response', (r) => { if (r.url().includes('/models/') && r.ok()) models.add(new URL(r.url()).pathname) })

  await page.goto('/?tier=high')
  // The loading screen only drops once every asset is downloaded AND every
  // shader is compiled (ShaderWarmup) — the "scene is fully ready" signal.
  await expect(page.getByText('Opening the garage door')).toBeHidden({ timeout: 4 * 60_000 })
  await expect(page.locator('canvas')).toBeVisible()
  expect(models.size, `models loaded: ${[...models].join(', ')}`).toBeGreaterThanOrEqual(25)

  // Prove the canvas has a picture in it (a render bug that draws nothing
  // still "loads" fine). Poll instead of a fixed wait: on a slow GPU-less
  // runner the garage door's roll-up can take far longer than its nominal 3s,
  // and a still-closed door is a near-uniform frame (this flaked once on CI).
  let shot = Buffer.alloc(0)
  await expect.poll(async () => {
    shot = await page.screenshot({ timeout: 2 * 60_000 })
    return centerStdDev(shot)
  }, {
    message: 'scene looks blank (uniform color) — nothing rendered',
    timeout: 3 * 60_000,
    intervals: [5_000, 10_000],
  }).toBeGreaterThan(12)
  await testInfo.attach('home-view', { body: shot, contentType: 'image/png' })

  expect(problems, problems.join('\n')).toEqual([])
})

test('LOW tier: every tab panel opens and closes', async ({ page }) => {
  const problems = watchForProblems(page)
  await page.goto('/?tier=low')
  await expect(page.getByText('Opening the garage door')).toBeHidden({ timeout: 3 * 60_000 })

  const back = page.getByRole('button', { name: /back to garage/i })
  for (const tab of PANEL_TABS) {
    await page.getByRole('button', { name: tab, exact: true }).click()
    await expect(back, `${tab} panel did not open`).toBeVisible({ timeout: 45_000 })
    await back.click()
    await expect(back, `${tab} panel did not close`).toBeHidden({ timeout: 45_000 })
  }

  expect(problems, problems.join('\n')).toEqual([])
})
