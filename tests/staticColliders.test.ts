import { describe, expect, it } from 'vitest'
import { getStaticBoxes, resolveCircleBox, ROOM, type StaticBox } from '../src/lib/staticColliders'

const box: StaticBox = { minX: 0, maxX: 2, minZ: 0, maxZ: 1, top: 1 }

describe('resolveCircleBox', () => {
  it('returns null and leaves the position alone when there is no overlap', () => {
    const pos = { x: -1, z: 0.5 }
    expect(resolveCircleBox(pos, 0.25, box)).toBeNull()
    expect(pos).toEqual({ x: -1, z: 0.5 })
  })

  it('treats touching at exactly radius distance as no overlap', () => {
    const pos = { x: -0.25, z: 0.5 }
    expect(resolveCircleBox(pos, 0.25, box)).toBeNull()
  })

  it('ejects through the nearest face (left)', () => {
    const pos = { x: 0.05, z: 0.5 }
    expect(resolveCircleBox(pos, 0.25, box)).toEqual({ axis: 'x', dir: -1 })
    expect(pos.x).toBeCloseTo(-0.25)
    expect(pos.z).toBe(0.5)
  })

  it('ejects through the nearest face (right)', () => {
    const pos = { x: 1.95, z: 0.5 }
    expect(resolveCircleBox(pos, 0.25, box)).toEqual({ axis: 'x', dir: 1 })
    expect(pos.x).toBeCloseTo(2.25)
  })

  it('ejects through the nearest face (back / front on z)', () => {
    const back = { x: 1, z: 0.02 }
    expect(resolveCircleBox(back, 0.25, box)).toEqual({ axis: 'z', dir: -1 })
    expect(back.z).toBeCloseTo(-0.25)
    const front = { x: 1, z: 0.98 }
    expect(resolveCircleBox(front, 0.25, box)).toEqual({ axis: 'z', dir: 1 })
    expect(front.z).toBeCloseTo(1.25)
  })

  it('never leaves the circle still overlapping after resolution', () => {
    for (let i = 0; i < 500; i++) {
      const pos = { x: -0.2 + Math.random() * 2.4, z: -0.2 + Math.random() * 1.4 }
      resolveCircleBox(pos, 0.25, box)
      expect(resolveCircleBox({ ...pos }, 0.25 - 1e-9, box)).toBeNull()
    }
  })
})

describe('getStaticBoxes', () => {
  it('only includes the car-lift colliders on tiers that render heavy models', () => {
    const light = getStaticBoxes(false)
    const heavy = getStaticBoxes(true)
    expect(heavy.length).toBeGreaterThan(light.length)
    for (const b of light) expect(heavy).toContainEqual(b)
  })

  // Documented convention (staticColliders.ts): a box face at/beyond a room
  // wall must extend well past it, or nearest-face ejection can point INTO the
  // wall and the ball ping-pongs forever between the wall clamp and the box.
  it('extends every wall-adjacent box well past the wall', () => {
    for (const b of getStaticBoxes(true)) {
      if (b.maxX >= ROOM.wallX - 0.9) expect(b.maxX).toBeGreaterThan(ROOM.wallX + 0.5)
      if (b.minX <= -ROOM.wallX + 0.9) expect(b.minX).toBeLessThan(-ROOM.wallX - 0.5)
      if (b.minZ <= ROOM.backZ + 0.9) expect(b.minZ).toBeLessThan(ROOM.backZ - 0.5)
    }
  })

  it('has well-formed boxes', () => {
    for (const b of getStaticBoxes(true)) {
      expect(b.maxX).toBeGreaterThan(b.minX)
      expect(b.maxZ).toBeGreaterThan(b.minZ)
      expect(b.top).toBeGreaterThan(0)
    }
  })
})
