import { useGLTF } from '@react-three/drei'

export default function SoccerBall() {
  const { scene } = useGLTF('/models/soccer_ball.glb')
  return <primitive object={scene} scale={0.25} castShadow />
}
