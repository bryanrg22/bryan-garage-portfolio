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

// Desktop tiers — detect-gpu score drives these. Desktop browsers have
// generous memory ceilings and parallel shader compile, so HIGH can be lush.

const DESKTOP_LOW: QualityConfig = {
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

const DESKTOP_MID: QualityConfig = {
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

const DESKTOP_HIGH: QualityConfig = {
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

// Mobile tiers — every tier shows the full decorative set (trophies, programming
// logos, garage tools, red bull, wd-40, etc.). Losing those makes the scene feel
// empty; keeping them costs ~20 MB of download but almost nothing at render time
// once shaders are pre-compiled. What varies between mobile tiers is *rendering*
// quality — DPR, environment, particles, lights. Shadows and antialias are off
// across all mobile tiers (biggest GPU cost on iOS). Heavy models (GTR ~15 MB,
// car lift) stay desktop-only — those genuinely stress mobile memory ceilings.

const MOBILE_LOW: QualityConfig = {
  tier: 'low',
  dpr: 1,
  shadows: false,
  antialias: false,
  environmentIntensity: 0,
  showEnvironment: false,
  showParticles: false,
  showHeavyModels: false,
  showPureDecorative: true,
  showSemiDecorative: true,
  showShopLightPoints: false,
  maxPointLights: 1,
}

const MOBILE_MID: QualityConfig = {
  tier: 'mid',
  dpr: [1, 1.5],
  shadows: false,
  antialias: false,
  environmentIntensity: 0.12,
  showEnvironment: true,
  showParticles: false,
  showHeavyModels: false,
  showPureDecorative: true,
  showSemiDecorative: true,
  showShopLightPoints: false,
  maxPointLights: 2,
}

const MOBILE_HIGH: QualityConfig = {
  tier: 'high',
  dpr: [1, 2],
  shadows: false,
  antialias: false,
  environmentIntensity: 0.18,
  showEnvironment: true,
  showParticles: true,
  // Heavy models became mobile-safe once the GTR is runtime-batched
  // (1388 draw calls -> ~22 in NissanGTR.tsx) and its transmission pass
  // is stripped. Retina iPhones/high-end Android handle this easily.
  showHeavyModels: true,
  showPureDecorative: true,
  showSemiDecorative: true,
  showShopLightPoints: true,
  maxPointLights: 2,
}

/** Synchronous mobile detection — available at module load, no async needed. */
function detectIsMobile(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia?.('(hover: none) and (pointer: coarse)').matches) return true
  const ua = navigator.userAgent || ''
  return /iPhone|iPad|iPod|Android|Mobile/i.test(ua)
}

/**
 * Mobile tier picker — UA-aware. iOS Safari caps navigator.hardwareConcurrency
 * (returns 2 on a 6-core A17 Pro for fingerprinting mitigation) and doesn't
 * implement navigator.deviceMemory at all, so we can't trust those signals on
 * iOS. Retina display is a reliable proxy — every iPhone 8+ and iPad 2+ ships
 * retina and all of them handle MOBILE_HIGH fine. Android keeps the
 * deviceMemory heuristic which is accurate there.
 */
function pickMobileTier(): QualityConfig {
  if (typeof window === 'undefined') return MOBILE_LOW
  const dpr = window.devicePixelRatio || 1
  const ua = navigator.userAgent || ''
  // iPad Pro in desktop mode reports "Macintosh" but has touch — catch that too.
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document)
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  const cores = navigator.hardwareConcurrency || 1

  if (isIOS) {
    return dpr >= 2 ? MOBILE_HIGH : MOBILE_MID
  }

  // Android / other: deviceMemory is implemented and reliable.
  if (memory !== undefined) {
    if (memory >= 4 && dpr >= 2) return MOBILE_HIGH
    if (memory >= 2) return MOBILE_MID
    return MOBILE_LOW
  }

  // Unknown UA with no memory API: fall back to cores + dpr.
  if (dpr >= 2 && cores >= 6) return MOBILE_HIGH
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
