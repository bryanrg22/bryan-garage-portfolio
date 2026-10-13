import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import { useStore } from '../../stores/useStore'

// Hard cap so a throttled background tab can never leave the loading
// screen up forever — worst case we reveal with a few shaders still
// compiling, which is exactly today's behaviour.
const WARMUP_TIMEOUT_MS = 6000

/**
 * Compiles every shader in the fully-loaded scene BEFORE the loading screen
 * drops, so the first visible frames (door roll-up, GTR appearing) never
 * stall on synchronous program linking. three.js' first render of a material
 * compiles+links its program on the spot; the GTR alone has 22 materials.
 *
 * Uses gl.compileAsync, which leans on KHR_parallel_shader_compile where the
 * driver offers it (Chrome/macOS does) and polls readiness with setTimeout —
 * NOT requestAnimationFrame — so it resolves fine under frameloop="demand".
 *
 * Readiness is observed via vanilla zustand subscriptions for the same reason
 * GarageDoor does it: a React subscription re-renders mid-load.
 */
export default function ShaderWarmup() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    let started = false
    let cancelled = false

    const finish = () => {
      if (cancelled) return
      useStore.getState().setIsCompiled()
      invalidate()
    }

    const check = () => {
      if (started) return
      const { progress, active } = useProgress.getState()
      if (!useStore.getState().isLoaded || active || progress < 100) return
      started = true
      const timeout = new Promise<void>((resolve) => setTimeout(resolve, WARMUP_TIMEOUT_MS))
      Promise.race([gl.compileAsync(scene, camera), timeout]).then(finish, finish)
    }

    check()
    const unsubProgress = useProgress.subscribe(check)
    const unsubStore = useStore.subscribe(check)
    return () => {
      cancelled = true
      unsubProgress()
      unsubStore()
    }
  }, [gl, scene, camera, invalidate])

  return null
}
