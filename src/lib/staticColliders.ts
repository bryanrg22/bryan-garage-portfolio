/**
 * Static furniture colliders shared by the kickable ball AND knockable props.
 * Boxes are solid below `top` (XZ footprint). Measured from the actual GLB
 * geometry where it matters (car lift, GTR, workbench) — see CLAUDE.md.
 *
 * CONVENTION: any box face sitting at/beyond a room wall is extended well
 * past it — otherwise the nearest-face ejection can point into the wall and
 * the object ping-pongs forever between the wall clamp and the box push-out.
 */

export interface StaticBox {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  top: number
}

/** Visual wall positions — subtract the moving object's radius to clamp. */
export const ROOM = {
  wallX: 4.85,
  backZ: -2.85,
  frontZ: 6.85,
}

const BASE_BOXES: StaticBox[] = [
  { minX: -6, maxX: -1.35, minZ: -1.7, maxZ: -0.3, top: 1.05 }, // left workbench (left wall)
  { minX: -0.3, maxX: 2.5, minZ: -4.5, maxZ: -2.2, top: 1.0 },  // back workbench (back wall)
]

// Car lift (measured: two tall posts + low drive-on track) and the GTR
// display model — these only exist on tiers with heavy models.
const HEAVY_BOXES: StaticBox[] = [
  { minX: 4.05, maxX: 6, minZ: -4, maxZ: -1.9, top: 3.0 },  // back post (right + back wall)
  { minX: 4.05, maxX: 6, minZ: 1.3, maxZ: 2.25, top: 3.0 }, // front post (right wall)
  { minX: 4.05, maxX: 6, minZ: -1.9, maxZ: 1.3, top: 0.35 }, // low track (right wall)
  { minX: -6, maxX: -3.75, minZ: -1.45, maxZ: -0.2, top: 1.35 }, // GTR model on the bench
]

export function getStaticBoxes(showHeavyModels: boolean): StaticBox[] {
  return showHeavyModels ? [...BASE_BOXES, ...HEAVY_BOXES] : BASE_BOXES
}

/**
 * Push a circle (center x/z, given radius) out of a box via its nearest face.
 * Returns the ejection axis and sign, or null if there was no overlap.
 * Only call when the object's height overlaps the box (y check is the
 * caller's job — the ball flies, props slide on the floor).
 */
export function resolveCircleBox(
  pos: { x: number; z: number },
  radius: number,
  box: StaticBox,
): { axis: 'x' | 'z'; dir: 1 | -1 } | null {
  const inX = pos.x > box.minX - radius && pos.x < box.maxX + radius
  const inZ = pos.z > box.minZ - radius && pos.z < box.maxZ + radius
  if (!inX || !inZ) return null
  const pushLeft = pos.x - (box.minX - radius)
  const pushRight = (box.maxX + radius) - pos.x
  const pushBack = pos.z - (box.minZ - radius)
  const pushFront = (box.maxZ + radius) - pos.z
  const min = Math.min(pushLeft, pushRight, pushBack, pushFront)
  if (min === pushLeft) { pos.x = box.minX - radius; return { axis: 'x', dir: -1 } }
  if (min === pushRight) { pos.x = box.maxX + radius; return { axis: 'x', dir: 1 } }
  if (min === pushBack) { pos.z = box.minZ - radius; return { axis: 'z', dir: -1 } }
  pos.z = box.maxZ + radius
  return { axis: 'z', dir: 1 }
}
