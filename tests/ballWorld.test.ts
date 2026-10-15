import { beforeEach, describe, expect, it, vi } from 'vitest'

// ballWorld syncs a "room is dirty" flag into the zustand store. The real
// store pulls in GPU detection and PostHog (browser-only), so stub it.
const setRoomDirty = vi.fn()
vi.mock('../src/stores/useStore', () => ({
  useStore: { getState: () => ({ setRoomDirty }) },
}))

// ballWorld installs dev-only console hooks on `window` (import.meta.env.DEV
// is true under Vitest); Node has no window, so give it an empty one.
vi.stubGlobal('window', {})

const world = await import('../src/lib/ballWorld')

describe('ballWorld displacement + tidy-up bookkeeping', () => {
  beforeEach(() => setRoomDirty.mockClear())

  it('counts displaced objects and drives the "Tidy up" button flag', () => {
    const offA = world.registerResettable('a', () => {})
    const offB = world.registerResettable('b', () => {})
    expect(world.displacedCount()).toBe(0)

    world.markDisplaced('a')
    world.markDisplaced('b')
    world.markDisplaced('a') // idempotent
    expect(world.displacedCount()).toBe(2)
    expect(setRoomDirty).toHaveBeenLastCalledWith(true)

    world.clearDisplaced('a')
    expect(world.displacedCount()).toBe(1)
    world.clearDisplaced('b')
    expect(world.displacedCount()).toBe(0)
    expect(setRoomDirty).toHaveBeenLastCalledWith(false)
    offA(); offB()
  })

  it('resetRoom calls every registered resetter exactly once', () => {
    const r1 = vi.fn(); const r2 = vi.fn()
    const off1 = world.registerResettable('r1', r1)
    const off2 = world.registerResettable('r2', r2)
    world.resetRoom()
    expect(r1).toHaveBeenCalledTimes(1)
    expect(r2).toHaveBeenCalledTimes(1)
    off1(); off2()
  })

  it('unregistering a displaced object removes it from the count (no stuck button)', () => {
    const off = world.registerResettable('gone', () => {})
    world.markDisplaced('gone')
    expect(world.displacedCount()).toBe(1)
    off()
    expect(world.displacedCount()).toBe(0)
    expect(setRoomDirty).toHaveBeenLastCalledWith(false)
  })
})
