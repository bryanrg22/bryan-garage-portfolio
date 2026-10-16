import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Every '/images/…', '/models/…' etc. string in the source must exist under
// public/ — a typo or a forgotten file is a broken image / missing 3D model in
// production, and nothing else (tsc, lint, vite build) catches it.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = path.join(ROOT, 'public')
const ASSET_DIRS = ['images', 'videos', 'models', 'hdri', 'draco', 'gpu-benchmarks', 'concrete_floor', 'chipboard_wall']
const REF = new RegExp(`['"\`](/(?:${ASSET_DIRS.join('|')})/[^'"\`]+)['"\`]`, 'g')

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return sourceFiles(p)
    return /\.(ts|tsx)$/.test(e.name) ? [p] : []
  })
}

const refs: { file: string; ref: string }[] = []
for (const file of sourceFiles(path.join(ROOT, 'src'))) {
  const text = fs.readFileSync(file, 'utf8')
  for (const m of text.matchAll(REF)) refs.push({ file: path.relative(ROOT, file), ref: m[1] })
}

describe('asset references', () => {
  it('finds the asset references (guards against the scan silently matching nothing)', () => {
    expect(refs.length).toBeGreaterThan(100)
  })

  it('every literal asset path in src/ exists in public/', () => {
    const missing = refs
      .filter(({ ref }) => !ref.includes('${'))
      .filter(({ ref }) => !fs.existsSync(path.join(PUBLIC, decodeURI(ref.split(/[?#]/)[0]))))
      .map(({ file, ref }) => `${ref}  (in ${file})`)
    expect(missing, `missing files:\n${missing.join('\n')}`).toEqual([])
  })

  // Models load through modelUrl(name), which serves /models/mobile/<name>.glb
  // on phones and /models/<name>.glb on desktop — so every name needs BOTH
  // files, or one platform gets a missing model. (Adding a model? Make its
  // phone twin with the recipe in src/lib/assetUrls.ts.)
  const modelNames = new Set<string>()
  for (const file of sourceFiles(path.join(ROOT, 'src'))) {
    for (const m of fs.readFileSync(file, 'utf8').matchAll(/modelUrl\('([^']+)'\)/g)) modelNames.add(m[1])
  }
  // GarageScene also preloads by name: `for (const file of [...]) useGLTF.preload(modelUrl(file))`
  const scene = fs.readFileSync(path.join(ROOT, 'src/components/Scene/GarageScene.tsx'), 'utf8')
  const preload = scene.match(/for \(const file of \[([\s\S]*?)\]\)\s*useGLTF\.preload/)
  if (preload) for (const m of preload[1].matchAll(/'([^']+)'/g)) modelNames.add(m[1])

  it('finds the model names (guards against the scan silently matching nothing)', () => {
    expect(modelNames.size).toBeGreaterThan(20)
  })

  it('every model has both a desktop file and a phone twin', () => {
    const missing = [...modelNames].flatMap((n) => [`models/${n}.glb`, `models/mobile/${n}.glb`])
      .filter((p) => !fs.existsSync(path.join(PUBLIC, p)))
    expect(missing, `missing:\n${missing.join('\n')}`).toEqual([])
  })
})
