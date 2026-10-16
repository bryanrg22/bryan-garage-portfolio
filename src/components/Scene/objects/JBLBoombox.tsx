import { useGLTF } from '@react-three/drei'
import { modelUrl } from '../../../lib/assetUrls'

export default function JBLBoombox() {
  const { scene } = useGLTF(modelUrl('jbl_boombox'))
  return <primitive object={scene} scale={0.0038} castShadow />
}
