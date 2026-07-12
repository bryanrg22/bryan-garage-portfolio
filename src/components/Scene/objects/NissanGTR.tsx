import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * The GTR ships as 1388 tiny mesh primitives sharing only 22 materials —
 * 1388 draw calls if rendered as-is, which is what kept it desktop-only.
 * At load we merge all geometry per material (classic static batching),
 * collapsing it to ~22 draw calls. We also neutralize
 * KHR_materials_transmission on the glass: any transmissive material makes
 * three.js render the whole scene to an offscreen texture first (a hidden
 * second render pass) — plain alpha blending looks close enough here.
 */
export default function NissanGTR() {
  const { scene } = useGLTF('/models/1999_nissan_skyline_gtr_r34_c-west__2f2f.glb')

  const merged = useMemo(() => {
    scene.updateMatrixWorld(true)
    // Group geometry by material + attribute signature (mergeGeometries
    // requires identical attribute sets within a batch)
    const groups = new Map<string, { material: THREE.Material; geometries: THREE.BufferGeometry[] }>()
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh || Array.isArray(mesh.material)) return
      const material = mesh.material as THREE.MeshPhysicalMaterial
      if (material.transmission && material.transmission > 0) {
        material.transmission = 0
        material.transparent = true
        material.opacity = Math.min(material.opacity, 0.4)
      }
      const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld)
      const signature = material.uuid + '|' + Object.keys(geometry.attributes).sort().join(',') + '|' + (geometry.index ? 'i' : 'n')
      const group = groups.get(signature)
      if (group) group.geometries.push(geometry)
      else groups.set(signature, { material, geometries: [geometry] })
    })

    const root = new THREE.Group()
    for (const { material, geometries } of groups.values()) {
      const geometry = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries, false)
      if (!geometry) continue
      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      root.add(mesh)
      // The merged copy owns the data now — free the intermediate clones
      if (geometries.length > 1) geometries.forEach((g) => g.dispose())
    }
    return root
  }, [scene])

  return <primitive object={merged} scale={21} />
}
