import { getGPUTier } from 'detect-gpu'

export interface QualityConfig {
  tier: 'low' | 'mid' | 'high'
  platform: 'mobile' | 'desktop'
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

// Desktop tiers — detect-gpu score drives these. Desktop browsers have
// generous memory ceilings and parallel shader compile, so HIGH can be lush.

const DESKTOP_LOW: QualityConfig = {
  tier: 'low',
  platform: 'desktop',
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

const DESKTOP_MID: QualityConfig = {
  tier: 'mid',
  platform: 'desktop',
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

const DESKTOP_HIGH: QualityConfig = {
  tier: 'high',
  platform: 'desktop',
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

// Mobile tiers — deliberately more conservative than their desktop namesakes.
// Even on an A17 Pro, iOS Safari has tight memory ceilings and no parallel
// shader compile, so we trade some fidelity for reliability. Heavy models
// (Nissan GTR ~15 MB) stay desktop-only regardless of phone class.

const MOBILE_LOW: QualityConfig = {
  tier: 'low',
  platform: 'mobile',
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

const MOBILE_MID: QualityConfig = {
  tier: 'mid',
  platform: 'mobile',
  dpr: [1, 1.5],
  shadows: false,
  antialias: false,
  environmentIntensity: 0.12,
  showEnvironment: true,
  showParticles: false,
  showHeavyModels: false,
  showPureDecorative: false,
  showSemiDecorative: false,
  showShopLightPoints: false,
  maxPointLights: 2,
}

const MOBILE_HIGH: QualityConfig = {
  tier: 'high',
  platform: 'mobile',
  dpr: [1, 2],
  shadows: false,
  antialias: false,
  environmentIntensity: 0.18,
  showEnvironment: true,
  showParticles: true,
  showHeavyModels: false,
  showPureDecorative: false,
  showSemiDecorative: true,
  showShopLightPoints: false,
  maxPointLights: 2,
}

/** Synchronous mobile detection — available at module load, no async needed. */
function detectIsMobile(): boolean {
  if (typeof window === 'undefined') return false
  // Primary signal: touch-only pointer (no hover capability)
  if (window.matchMedia?.('(hover: none) and (pointer: coarse)').matches) return true
  // UA fallback (iPad Pro in desktop mode can slip past matchMedia)
  const ua = navigator.userAgent || ''
  return /iPhone|iPad|iPod|Android|Mobile/i.test(ua)
}

/** Mobile tier picker — devicePixelRatio + deviceMemory heuristic. No WebGL benchmark. */
function pickMobileTier(): QualityConfig {
  if (typeof window === 'undefined') return MOBILE_LOW
  const dpr = window.devicePixelRatio || 1
  // navigator.deviceMemory is Chrome/Android only; undefined on iOS Safari.
  // Returns GiB, capped at 8. Use as a coarse signal when present.
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  const cores = navigator.hardwareConcurrency || 1

  // Conservative bar for HIGH: retina display AND (enough memory OR enough cores).
  // iPhone 12+ hits this (dpr 3, 6 cores). Older/weaker phones fall to MID or LOW.
  if (dpr >= 2 && (memory === undefined ? cores >= 6 : memory >= 4)) return MOBILE_HIGH
  if (dpr >= 2 || cores >= 4) return MOBILE_MID
  return MOBILE_LOW
}

function desktopTierFromGPU(gpuTier: number): QualityConfig {
  if (gpuTier <= 1) return DESKTOP_LOW
  if (gpuTier === 2) return DESKTOP_MID
  return DESKTOP_HIGH
}

const IS_MOBILE = detectIsMobile()

/**
 * Default config used at module load. On mobile we pick the final tier
 * synchronously so the Canvas never remounts. On desktop we start pessimistic
 * (LOW) and let detect-gpu upgrade us — desktop can absorb a tier-change
 * remount without the iOS memory/shader hitch.
 */
export const defaultQuality: QualityConfig = IS_MOBILE ? pickMobileTier() : DESKTOP_LOW

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

/**
 * Resolves to the final quality config. On mobile, resolves synchronously
 * to the already-picked tier — skipping detect-gpu's WebGL benchmark, which
 * on iOS competes for the same scarce GPU context we're about to use.
 */
export const detectionPromise: Promise<QualityConfig> = IS_MOBILE
  ? Promise.resolve(defaultQuality)
  : withTimeout(
      getGPUTier({ failIfMajorPerformanceCaveat: false }),
      DETECTION_TIMEOUT_MS,
    ).then(
      (result) => desktopTierFromGPU(result.tier),
      () => DESKTOP_LOW,
    )
