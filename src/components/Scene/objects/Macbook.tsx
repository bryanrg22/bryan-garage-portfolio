import { useGLTF } from '@react-three/drei'
import { modelUrl } from '../../../lib/assetUrls'

export default function Macbook() {
  const { scene } = useGLTF(modelUrl('macbook'))
  return <primitive object={scene} scale={0.024} castShadow />
}
