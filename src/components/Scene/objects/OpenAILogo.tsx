import { useEffect, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { ExtrudeGeometry } from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'

export default function OpenAILogo() {
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
    <group position={[-2.63, 1.323, -0.85]}>
      <group rotation={[0, 0.18, 0]}>
        <group position={[-0.282, 0.282, -0.047]} scale={[0.0235, -0.0235, 0.0235]}>
          {geometries.map((geometry, index) => (
            <mesh key={index} geometry={geometry} castShadow>
              <meshStandardMaterial color="#e9eceb" roughness={0.28} metalness={0.45} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}
