import { IS_MOBILE } from './gpuTier'

/**
 * Phones load lighter twins of the scene assets. Each phone model in
 * `public/models/mobile/` has the same file name as its desktop original and
 * was made with: prune unused attributes → textures capped at 512px →
 * simplify (≤50%, error 0.005) for meshes over 15k triangles → draco. Compared
 * side by side on an iPhone-sized screen in every view, they look the same;
 * the phone download drops from 6.86 MB to ~4.8 MB. Desktop keeps the
 * originals. Every model passed here MUST exist in both folders (enforced by
 * tests/assetReferences.test.ts) — the desktop-only car lift doesn't use this.
 */
export const modelUrl = (name: string) =>
  IS_MOBILE ? `/models/mobile/${name}.glb` : `/models/${name}.glb`

/** Lighting HDR: 256×128 on phones (diffuse lighting identical, −75% bytes). */
export const ENV_HDR = IS_MOBILE ? '/hdri/empty_warehouse_01_256.hdr' : '/hdri/empty_warehouse_01_512.hdr'

/** The resume lying on the floor: 768px wide on phones (277 KB → 135 KB). */
export const RESUME_IMAGE = IS_MOBILE ? '/images/resume_image_768.webp' : '/images/resume_image.webp'
