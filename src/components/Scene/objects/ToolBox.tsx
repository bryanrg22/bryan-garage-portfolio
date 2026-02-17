import { useGLTF } from '@react-three/drei'

export default function ToolBox() {
  const { scene } = useGLTF('/models/tool_box.glb')
  return <primitive object={scene} scale={0.25} rotation={[0, -Math.PI / 2, 0]} castShadow />
}
