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

/** Default config used before detection resolves */
export const defaultQuality: QualityConfig = MID

/** Promise that resolves to the detected quality config */
export const detectionPromise: Promise<QualityConfig> = getGPUTier({
  failIfMajorPerformanceCaveat: false,
}).then(
  (result) => tierFromGPU(result.tier),
  () => MID, // fallback on detection failure
)
