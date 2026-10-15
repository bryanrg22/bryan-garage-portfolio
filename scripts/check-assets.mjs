// Asset gate for the 3D scene: every GLB must be spec-valid (Khronos glTF
// Validator) and inside size / triangle budgets, and the total payload must
// stay under budget. Catches the class of problem that shipped a 290k-triangle
// trophy and a 2.6 MB dirty rag — nothing in tsc/lint/build looks at assets.
//
// Budgets are deliberately generous for today's scene; tighten them as you go.
// To allow a specific heavy model, add it to ALLOW with a reason.
import fs from 'node:fs'
import path from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'
import validator from 'gltf-validator'

const MODELS = 'public/models'
const HDRI = 'public/hdri'
const BUDGET = {
  modelBytes: 1.0 * 1024 * 1024,      // per GLB
  modelTriangles: 120_000,            // per GLB (rendered, all mesh instances)
  totalModelBytes: 12 * 1024 * 1024,  // whole public/models
  hdrBytes: 1.0 * 1024 * 1024,        // per environment map
}
const ALLOW = {
  // Desktop-HIGH-only display car; 22 materials, see NissanGTR.tsx.
  '1999_nissan_skyline_gtr_r34_c-west__2f2f.glb': { modelBytes: 4 * 1024 * 1024, modelTriangles: 300_000 },
}

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() })

const kb = (b) => `${(b / 1024).toFixed(0)} KB`
const failures = []
const rows = []
let total = 0

for (const file of fs.readdirSync(MODELS).filter((f) => f.endsWith('.glb')).sort()) {
  const p = path.join(MODELS, file)
  const bytes = fs.statSync(p).size
  total += bytes
  const limit = { ...BUDGET, ...ALLOW[file] }

  const report = await validator.validateBytes(new Uint8Array(fs.readFileSync(p)), { maxIssues: 20 })
  const { numErrors, numWarnings } = report.issues
  if (numErrors > 0) {
    const first = report.issues.messages.filter((m) => m.severity === 0).slice(0, 3)
      .map((m) => `${m.code} ${m.pointer ?? ''}`).join('; ')
    failures.push(`${file}: ${numErrors} glTF validation error(s) — ${first}`)
  }

  const doc = await io.read(p)
  let triangles = 0
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh()
    if (!mesh) continue
    for (const prim of mesh.listPrimitives()) {
      if (prim.getMode() !== 4) continue // TRIANGLES only
      const idx = prim.getIndices()
      const pos = prim.getAttribute('POSITION')
      triangles += Math.floor((idx ? idx.getCount() : pos ? pos.getCount() : 0) / 3)
    }
  }

  if (bytes > limit.modelBytes) failures.push(`${file}: ${kb(bytes)} > ${kb(limit.modelBytes)} budget`)
  if (triangles > limit.modelTriangles) {
    failures.push(`${file}: ${triangles.toLocaleString()} triangles > ${limit.modelTriangles.toLocaleString()} budget ` +
      '(decimate: gltf-transform prune --keep-attributes false → simplify --ratio … → draco, see CLAUDE.md)')
  }
  rows.push([file, kb(bytes), triangles.toLocaleString(), numWarnings])
}

if (total > BUDGET.totalModelBytes) failures.push(`public/models total ${kb(total)} > ${kb(BUDGET.totalModelBytes)} budget`)

for (const file of fs.readdirSync(HDRI).filter((f) => f.endsWith('.hdr'))) {
  const bytes = fs.statSync(path.join(HDRI, file)).size
  if (bytes > BUDGET.hdrBytes) failures.push(`${HDRI}/${file}: ${kb(bytes)} > ${kb(BUDGET.hdrBytes)} budget`)
}

const w = [44, 9, 10]
console.log('model'.padEnd(w[0]), 'size'.padStart(w[1]), 'triangles'.padStart(w[2]), ' validator warnings')
for (const [f, s, t, warn] of rows) console.log(f.padEnd(w[0]), s.padStart(w[1]), t.padStart(w[2]), ` ${warn}`)
console.log(`\n${rows.length} models, ${kb(total)} total (budget ${kb(BUDGET.totalModelBytes)})`)

if (failures.length) {
  console.error(`\n✗ ${failures.length} asset check(s) failed:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log('✓ all asset checks passed')
