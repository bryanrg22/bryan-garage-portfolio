import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * NOTE: this model is 1388 mesh primitives / 22 materials — very draw-call
 * heavy, which is why it stays desktop-only. A runtime merge-by-material
 * attempt (static batching) rendered nothing (suspected attribute/winding
 * incompatibilities in this rip) and was reverted; a future pass should
 * re-batch it offline with proper visual verification, then re-enable
 * showHeavyModels on MOBILE_HIGH.
 *
 * We do strip KHR_materials_transmission here: any transmissive material
 * forces three.js to render the whole scene to an offscreen texture first
 * (a hidden second render pass). Plain alpha-blended glass looks close
 * enough and halves the cost of having the car on screen.
 */
export default function NissanGTR() {
  const { scene } = useGLTF('/models/1999_nissan_skyline_gtr_r34_c-west__2f2f.glb')

  useMemo(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh || Array.isArray(mesh.material)) return
      const material = mesh.material as THREE.MeshPhysicalMaterial
      if (material.transmission && material.transmission > 0) {
        material.transmission = 0
        material.transparent = true
        material.opacity = Math.min(material.opacity, 0.4)
      }
    })
    return null
  }, [scene])

  return <primitive object={scene} scale={21} castShadow />
}
