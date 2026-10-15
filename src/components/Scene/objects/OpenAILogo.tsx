import { useEffect, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { ExtrudeGeometry } from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'

const SVG_UNITS = 24 // viewBox is 0 0 24 24
const EXTRUDE_DEPTH = 4 // in SVG units, see ExtrudeGeometry below

/**
 * OpenAI mark extruded from its SVG (no GLB download). `size` is the mark's
 * width/height in meters; it's offset so `position` is the bottom-center of
 * the mark — set y to the bench top and it stands on the surface.
 */
export default function OpenAILogo({ position, rotationY = 0, size = 0.56 }: {
  position: [number, number, number]
  rotationY?: number
  size?: number
}) {
  const s = size / SVG_UNITS
  const svg = useLoader(SVGLoader, '/images/experience/openai-mark.svg')
  const geometries = useMemo(() => svg.paths.flatMap((path) =>
    SVGLoader.createShapes(path).map((shape) => new ExtrudeGeometry(shape, {
      depth: EXTRUDE_DEPTH,
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
      <group
        position={[-(SVG_UNITS / 2) * s, SVG_UNITS * s, -(EXTRUDE_DEPTH / 2) * s]}
        scale={[s, -s, s]}
      >
        {geometries.map((geometry, index) => (
          <mesh key={index} geometry={geometry} castShadow>
            <meshStandardMaterial color="#e9eceb" roughness={0.28} metalness={0.45} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
