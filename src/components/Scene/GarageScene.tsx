import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import Garage from './Garage'
import CameraController from './CameraController'
import RenderController from './RenderController'
import ShaderWarmup from './ShaderWarmup'
import Particles from './Particles'
import InteractiveObject from './objects/InteractiveObject'
import KickableSoccerBall from './objects/KickableSoccerBall'
import KnockableProp from './objects/KnockableProp'
import ShopDog from './objects/ShopDog'
import GarageDoor from './GarageDoor'
import Macbook from './objects/Macbook'
import JBLBoombox from './objects/JBLBoombox'
import CarLift from './objects/CarLift'
import ToolBox from './objects/ToolBox'
import AssetSuspense from './AssetSuspense'
import { portfolioItems } from '../../data/portfolio'
import { useStore } from '../../stores/useStore'
import type { QualityConfig } from '../../lib/gpuTier'

// Draco decoder for compressed GLB models — self-hosted (copied from
// three/examples/jsm/libs/draco/gltf) so first model load skips a DNS+TLS
// round-trip to gstatic.com and works offline
useGLTF.setDecoderPath('/draco/')

// Models that load on EVERY tier start downloading the moment this module
// evaluates — before detect-gpu has resolved and the Canvas has mounted — so
// the network round-trip overlaps GPU detection instead of waiting on it
// (~1s on desktop). Tier-gated decoratives are deliberately left out: on a
// LOW tier they'd be bandwidth spent on models that never render. Must come
// after setDecoderPath above, or these would fetch the decoder from gstatic.
for (const file of [
  'nvidia_3d_logo', 'mexican_flag', 'workbench', 'linkedin_logo', 'github_logo',
  'shiba_inu', 'soccer_ball', 'jbl_boombox', 'macbook', 'tool_box',
]) useGLTF.preload(`/models/${file}.glb`)

// Every GLB is requested up front, in parallel, behind the loading screen.
// An earlier "progressive load" staggered the models with 0.5s/1.5s/1.5s
// timeouts to "let the GPU breathe" — but the loading screen dismissed after
// the first batch, so the stagger pushed every decode + shader-compile stall
// out into view (measured: the heaviest model landed ~8s in and froze a
// visible frame).
// Now the loading screen waits for all of it and ShaderWarmup precompiles.

/** Map item id → lazy-loaded GLB component */
function GLBChild({ id }: { id: string }) {
  switch (id) {
    case 'skills':
      return <ToolBox />
    case 'boombox':
      return <JBLBoombox />
    case 'projects':
      return <Macbook />
    default:
      return undefined
  }
}

function SceneContent({ quality }: { quality: QualityConfig }) {
  return (
    <>
      {portfolioItems.map((item) => {
        const hasGLB = ['soccer', 'skills', 'boombox', 'projects'].includes(item.id)
        // Soccer ball is special: click opens the story, drag-and-release kicks it
        if (item.id === 'soccer') {
          return (
            <AssetSuspense key={item.id}>
              <KickableSoccerBall item={item} />
            </AssetSuspense>
          )
        }
        // Boombox gets shoved around by the ball; the heavy toolbox only
        // slides a little. Both stay fully clickable (KnockableProp wraps,
        // it doesn't intercept pointer events).
        if (item.id === 'boombox' || item.id === 'skills') {
          const knock = item.id === 'boombox'
            ? { id: 'boombox', radius: 0.55, height: 0.5, massFactor: 0.35, resetDelay: 0.1 }
            : { id: 'toolbox', radius: 0.6, height: 1.0, massFactor: 0.15, resetDelay: 0.15 }
          return (
            <KnockableProp key={item.id} {...knock} position={item.position} tippable={false}>
              <InteractiveObject item={{ ...item, position: [0, 0, 0] }}>
                <AssetSuspense>
                  <GLBChild id={item.id} />
                </AssetSuspense>
              </InteractiveObject>
            </KnockableProp>
          )
        }
        return (
          <InteractiveObject key={item.id} item={item}>
            {hasGLB ? (
              <AssetSuspense>
                <GLBChild id={item.id} />
              </AssetSuspense>
            ) : undefined}
          </InteractiveObject>
        )
      })}
      {/* Car lift — decorative only, not interactive. Hidden on low/mid tiers for performance. */}
      {quality.showHeavyModels && (
        <AssetSuspense>
          <group position={[2.5, 0, 2.8]}>
            <CarLift />
          </group>
        </AssetSuspense>
      )}
    </>
  )
}

export default function GarageScene() {
  const setActiveItem = useStore((s) => s.setActiveItem)
  const setIsLoaded = useStore((s) => s.setIsLoaded)
  const quality = useStore((s) => s.qualityConfig)
  const [sceneKey, setSceneKey] = useState(0)

  const handleCreated = useCallback(
    ({ gl }: { gl: THREE.WebGLRenderer }) => {
      // Dark background so context loss doesn't flash white
      gl.setClearColor(new THREE.Color('#14120F'), 1)

      // WebGL context-loss recovery
      const canvas = gl.domElement
      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault()
        console.warn('WebGL context lost — will attempt restore')
      })
      canvas.addEventListener('webglcontextrestored', () => {
        console.info('WebGL context restored — remounting scene')
        setSceneKey((k) => k + 1)
      })

      // Shader compilation is NOT done here: at onCreated the GLBs haven't
      // arrived yet, so a compile pass would miss nearly everything. It runs
      // in ShaderWarmup once every asset is in (and async — see that file).
      setIsLoaded()
    },
    [setIsLoaded],
  )

  return (
    <div className="absolute inset-0" style={{ background: '#14120F', touchAction: 'none' }}>
      <Canvas
        // The tier is final before this Canvas ever mounts (App waits on
        // qualityResolved), so the tier half of this key never changes in
        // practice — gl props (antialias, shadows) are only read at context
        // creation, so it stays as a guard. sceneKey remounts on context loss.
        key={`${sceneKey}-${quality.tier}`}
        frameloop="demand"
        shadows={quality.shadows}
        dpr={quality.dpr}
        gl={{
          antialias: quality.antialias,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: true,
        }}
        camera={{ fov: 50, near: 0.1, far: 100 }}
        onPointerMissed={() => setActiveItem(null)}
        onCreated={handleCreated}
      >
        <fog attach="fog" args={['#1a1408', 6, 22]} />
        {quality.showEnvironment && (
          <AssetSuspense>
            {/* Self-hosted copy of drei's "warehouse" preset, downsampled 1024x512 →
                512x256 (1.6 MB → 0.4 MB). It only lights reflections at intensity
                ≤0.3 — never shown as a background — and PMREM blurs it per roughness
                level anyway. Avoids a runtime fetch from raw.githack.com. */}
            <Environment files="/hdri/empty_warehouse_01_512.hdr" environmentIntensity={quality.environmentIntensity} />
          </AssetSuspense>
        )}
        <RenderController />
        <ShaderWarmup />
        <CameraController />
        <Garage />
        <GarageDoor />
        <AssetSuspense>
          <ShopDog />
        </AssetSuspense>
        {quality.showParticles && <Particles />}
        <SceneContent quality={quality} />
      </Canvas>
    </div>
  )
}
