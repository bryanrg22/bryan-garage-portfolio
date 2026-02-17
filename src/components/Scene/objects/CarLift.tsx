import { useGLTF } from '@react-three/drei'

export default function CarLift() {
  const { scene } = useGLTF('/models/car_lift.glb')
  return <primitive object={scene} scale={1.3} castShadow />
}
