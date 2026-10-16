import { useGLTF } from '@react-three/drei'
import { modelUrl } from '../../../lib/assetUrls'

export default function ToolBox() {
  const { scene } = useGLTF(modelUrl('tool_box'))
  return <primitive object={scene} scale={0.25} rotation={[0, -Math.PI / 2, 0]} castShadow />
}
