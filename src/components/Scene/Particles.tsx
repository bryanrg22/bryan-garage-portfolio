import { Sparkles } from '@react-three/drei'

export default function Particles() {
  return (
    <Sparkles
      count={60}
      scale={[10, 5, 8]}
      size={1.5}
      speed={0.3}
      color="#F4C963"
      opacity={0.4}
      position={[0, 2, 0]}
    />
  )
}
