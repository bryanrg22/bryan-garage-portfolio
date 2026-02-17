import { useGLTF } from '@react-three/drei'

export default function NissanGTR() {
  const { scene } = useGLTF('/models/1999_nissan_skyline_gtr_r34_c-west__2f2f.glb')
  return <primitive object={scene} scale={21} castShadow />
}
