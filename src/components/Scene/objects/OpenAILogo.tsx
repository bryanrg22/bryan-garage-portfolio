import { useEffect, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { ExtrudeGeometry } from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'

/**
 * OpenAI mark extruded from its SVG (no GLB download). The 24-unit SVG
 * viewBox is scaled to ~0.56 m and offset so `position` is the bottom-center
 * of the mark — set y to the bench top and it stands on the surface.
 */
export default function OpenAILogo({ position, rotationY = 0 }: {
  position: [number, number, number]
  rotationY?: number
}) {
  const svg = useLoader(SVGLoader, '/images/experience/openai-mark.svg')
  const geometries = useMemo(() => svg.paths.flatMap((path) =>
    SVGLoader.createShapes(path).map((shape) => new ExtrudeGeometry(shape, {
      depth: 4,
      bevelEnabled: true,
      bevelSize: 0.22,
      bevelThickness: 0.22,
      bevelSegments: 3,
      curveSegments: 12,
      steps: 1,
    })),
  ), [svg])
  useEffect(() => () => geometries.forEach((geometry) => geometry.dispose()), [geometries])

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* SVG y points down: flip it, and shift so the mark's bottom-center is the origin */}
      <group position={[-0.282, 0.565, -0.047]} scale={[0.0235, -0.0235, 0.0235]}>
        {geometries.map((geometry, index) => (
          <mesh key={index} geometry={geometry} castShadow>
            <meshStandardMaterial color="#e9eceb" roughness={0.28} metalness={0.45} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
