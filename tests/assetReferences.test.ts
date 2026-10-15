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

  // GarageScene preloads models by name via a template literal
  // (`/models/${file}.glb`); check that list explicitly.
  it('every preloaded model name has a .glb file', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/components/Scene/GarageScene.tsx'), 'utf8')
    const list = src.match(/for \(const file of \[([\s\S]*?)\]\)\s*useGLTF\.preload/)
    if (!list) return // preload list removed — nothing to check
    const names = [...list[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
    expect(names.length).toBeGreaterThan(0)
    const missing = names.filter((n) => !fs.existsSync(path.join(PUBLIC, 'models', `${n}.glb`)))
    expect(missing).toEqual([])
  })
})
