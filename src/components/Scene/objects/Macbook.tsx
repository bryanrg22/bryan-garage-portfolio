import { useGLTF } from '@react-three/drei'

export default function Macbook() {
  const { scene } = useGLTF('/models/macbook.glb')
  return <primitive object={scene} scale={0.024} castShadow />
}
