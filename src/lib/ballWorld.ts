import * as THREE from 'three'
import { useStore } from '../stores/useStore'

/**
 * Shared mutable world state connecting the kickable soccer ball with
 * knockable props and the "tidy up" reset flow. Module-level (not React
 * state) so physics code reads/writes it synchronously inside useFrame.
 *
 * `pos`/`vel` are re-pointed to the ball's own vectors when it mounts, so
 * props can both read the ball's motion and steal energy from it on impact.
 */
export const ballWorld = {
  pos: new THREE.Vector3(),
  vel: new THREE.Vector3(),
  moving: false,
}

/**
 * Live physics body of a knockable prop, for prop-to-prop collisions —
 * a sliding toolbox plows the floor logos along instead of clipping them.
 * `pos` is the prop's live vector (mutating it moves the prop).
 */
export interface PropBody {
  id: string
  pos: THREE.Vector3
  radius: number
  massFactor: number
  resetting: () => boolean
  wake: (vx: number, vz: number) => void
}

export const propBodies = new Map<string, PropBody>()

export function registerPropBody(body: PropBody) {
  propBodies.set(body.id, body)
  return () => { propBodies.delete(body.id) }
}

const displaced = new Set<string>()
const resetters = new Map<string, () => void>()

/** Register an object that can be animated back to its home transform. */
export function registerResettable(id: string, reset: () => void) {
  resetters.set(id, reset)
  return () => {
    resetters.delete(id)
    displaced.delete(id)
    syncDirty()
  }
}

/** Mark an object as knocked out of place — shows the reset button. */
export function markDisplaced(id: string) {
  displaced.add(id)
  syncDirty()
}

/** Mark an object as back home — hides the button once everything is tidy. */
export function clearDisplaced(id: string) {
  displaced.delete(id)
  syncDirty()
}

function syncDirty() {
  useStore.getState().setRoomDirty(displaced.size > 0)
}

/** Animate every displaced object back home. */
export function resetRoom() {
  for (const reset of resetters.values()) reset()
}

// Dev-only test hooks
if (import.meta.env.DEV) {
  const w = window as Window & { __resetRoom?: () => void; __props?: () => { id: string; pos: number[] }[] }
  w.__resetRoom = resetRoom
  w.__props = () => [...propBodies.values()].map((b) => ({ id: b.id, pos: b.pos.toArray() }))
}
