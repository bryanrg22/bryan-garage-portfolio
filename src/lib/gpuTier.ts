import { getGPUTier } from 'detect-gpu'

export interface QualityConfig {
  tier: 'low' | 'mid' | 'high'
  dpr: number | [number, number]
  shadows: boolean
  antialias: boolean
  environmentIntensity: number
  showEnvironment: boolean
  showParticles: boolean
  showHeavyModels: boolean
  showPureDecorative: boolean
  showSemiDecorative: boolean
  showShopLightPoints: boolean
  maxPointLights: number
}

const LOW: QualityConfig = {
  tier: 'low',
  dpr: 1,
  shadows: false,
  antialias: false,
  environmentIntensity: 0,
  showEnvironment: false,
  showParticles: false,
  showHeavyModels: false,
  showPureDecorative: false,
  showSemiDecorative: false,
  showShopLightPoints: false,
  maxPointLights: 1,
}

const MID: QualityConfig = {
  tier: 'mid',
  dpr: [1, 1.5],
  shadows: true,
  antialias: true,
  environmentIntensity: 0.15,
  showEnvironment: true,
  showParticles: true,
  showHeavyModels: false,
  showPureDecorative: false,
  showSemiDecorative: true,
  showShopLightPoints: true,
  maxPointLights: 3,
}

const HIGH: QualityConfig = {
  tier: 'high',
  dpr: [1, 1.25],
  shadows: true,
  antialias: true,
  environmentIntensity: 0.3,
  showEnvironment: true,
  showParticles: true,
  showHeavyModels: true,
  showPureDecorative: true,
  showSemiDecorative: true,
  showShopLightPoints: true,
  maxPointLights: 3,
}

function tierFromGPU(gpuTier: number): QualityConfig {
  if (gpuTier <= 1) return LOW
  if (gpuTier === 2) return MID
  return HIGH
}

/** Default config used before detection resolves — LOW so we fail safe, not fail pretty */
export const defaultQuality: QualityConfig = LOW

const DETECTION_TIMEOUT_MS = 2500

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('gpu-detect-timeout')), ms)
    promise.then(
      (value) => { clearTimeout(timer); resolve(value) },
      (err) => { clearTimeout(timer); reject(err) },
    )
  })
}

// detect-gpu spins up a throwaway WebGL context and runs a benchmark; on some
// integrated GPUs / broken drivers it stalls indefinitely. Race it against a timeout.
export const detectionPromise: Promise<QualityConfig> = withTimeout(
  getGPUTier({ failIfMajorPerformanceCaveat: false }),
  DETECTION_TIMEOUT_MS,
).then(
  (result) => tierFromGPU(result.tier),
  () => LOW, // fallback on timeout or detection failure
)
