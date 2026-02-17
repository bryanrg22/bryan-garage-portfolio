import { useGLTF } from '@react-three/drei'

export default function JBLBoombox() {
  const { scene } = useGLTF('/models/jbl_boombox.glb')
  return <primitive object={scene} scale={0.0038} castShadow />
}
