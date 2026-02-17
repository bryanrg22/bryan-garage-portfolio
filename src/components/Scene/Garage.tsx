import { useRef, useEffect, useState, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Html } from '@react-three/drei'
import * as THREE from 'three'

/** Brea Auto Body sign — image texture on a plane */
function BreaBoardSign() {
  const texture = useTexture('/images/breaAutoBody.jpeg')
  return (
    <mesh position={[0, 3.8, -2.92]} castShadow>
      <planeGeometry args={[3.5, 1.12]} />
      <meshStandardMaterial map={texture} roughness={0.8} metalness={0.05} />
    </mesh>
  )
}

useTexture.preload('/images/breaAutoBody.jpeg')

/** USC Trojan logo — image texture on the left wall */
function USCTrojanSign() {
  const texture = useTexture('/images/usc_trojan_logo.png')
  return (
    <mesh position={[-4.9, 3.2, -1]} rotation={[0, Math.PI / 2, 0]} castShadow>
      <planeGeometry args={[1.2, 1.2]} />
      <meshStandardMaterial map={texture} roughness={0.8} metalness={0.05} transparent />
    </mesh>
  )
}

useTexture.preload('/images/usc_trojan_logo.png')

/** Azusa city logo — image texture on the left wall */
function AzusaCitySign() {
  const texture = useTexture('/images/azusa_city_logo.png')
  return (
    <mesh position={[-4.9, 3.05, 0.8]} rotation={[0, Math.PI / 2, 0]} castShadow>
      <planeGeometry args={[1.2, 1.2]} />
      <meshStandardMaterial map={texture} roughness={0.8} metalness={0.05} transparent />
    </mesh>
  )
}

useTexture.preload('/images/azusa_city_logo.png')

/** California flag — image texture on the left wall */
function CaliforniaFlag() {
  const texture = useTexture('/images/california_flag.webp')
  return (
    <mesh position={[-4.9, 1.8, 0.8]} rotation={[0, Math.PI / 2, 0]} castShadow>
      <planeGeometry args={[1.2, 0.8]} />
      <meshStandardMaterial map={texture} roughness={0.8} metalness={0.05} />
    </mesh>
  )
}

useTexture.preload('/images/california_flag.webp')

/** MLH logo — image texture on the right wall */
function MLHSign() {
  const texture = useTexture('/images/mlh_logo.png')
  return (
    <mesh position={[4.9, 3.2, -0.7]} rotation={[0, -Math.PI / 2, 0]} castShadow>
      <planeGeometry args={[2, 0.8]} />
      <meshStandardMaterial map={texture} roughness={0.8} metalness={0.05} transparent />
    </mesh>
  )
}

useTexture.preload('/images/mlh_logo.png')

/** Jane Street logo — image texture on back wall, behind workbench */
function JaneStreetSign() {
  const texture = useTexture('/images/janestreetLogo.png')
  return (
    <mesh position={[-3.46, 2.15, -2.92]} castShadow>
      <planeGeometry args={[1.8, 0.71]} />
      <meshStandardMaterial map={texture} roughness={0.8} metalness={0.05} transparent />
    </mesh>
  )
}

useTexture.preload('/images/janestreetLogo.png')

/** Harvard logo — image texture on back wall above trophies */
function HarvardSign() {
  const texture = useTexture('/images/harvardLogo.png')
  return (
    <mesh position={[2.1, 2.4, -2.92]} castShadow>
      <planeGeometry args={[0.7, 0.7]} />
      <meshStandardMaterial map={texture} roughness={0.8} metalness={0.05} transparent />
    </mesh>
  )
}

useTexture.preload('/images/harvardLogo.png')

/** Caltech logo — image texture on back wall above trophies */
function CaltechSign() {
  const texture = useTexture('/images/caltechLogo.png')
  return (
    <mesh position={[2.9, 2.4, -2.92]} castShadow>
      <planeGeometry args={[0.7, 0.7]} />
      <meshStandardMaterial map={texture} roughness={0.8} metalness={0.05} transparent />
    </mesh>
  )
}

useTexture.preload('/images/caltechLogo.png')

useTexture.preload('/concrete_floor/Concrete035_1K-JPG_Color.jpg')
useTexture.preload('/concrete_floor/Concrete035_1K-JPG_NormalGL.jpg')
useTexture.preload('/concrete_floor/Concrete035_1K-JPG_Roughness.jpg')

useTexture.preload('/chipboard_wall/Chipboard002_1K-JPG_Color.jpg')
useTexture.preload('/chipboard_wall/Chipboard002_1K-JPG_NormalGL.jpg')
useTexture.preload('/chipboard_wall/Chipboard002_1K-JPG_Roughness.jpg')

/** Concrete floor with PBR textures */
function ConcreteFloor() {
  const colorMap = useTexture('/concrete_floor/Concrete035_1K-JPG_Color.jpg')
  const normalMap = useTexture('/concrete_floor/Concrete035_1K-JPG_NormalGL.jpg')
  const roughnessMap = useTexture('/concrete_floor/Concrete035_1K-JPG_Roughness.jpg')

  for (const tex of [colorMap, normalMap, roughnessMap]) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(8, 8)
  }

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        color="#777777"
        metalness={0.15}
      />
    </mesh>
  )
}

/** Nvidia 3D logo — decorative, on workbench near macbook */
function NvidiaLogo({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/nvidia_3d_logo.glb')
  return <primitive object={scene} position={position} scale={0.07} rotation={[Math.PI / 2, 0, 0.3]} castShadow />
}

/** Amazon logo — decorative, on workbench behind nvidia */
function AmazonLogo({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/amazon_logo.glb')
  return <primitive object={scene} position={position} scale={0.0008} rotation={[0, -0.2, 0]} castShadow />
}

/** Red Bull can — decorative GLB on workbench */
function RedBullCan({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/red_bull_can.glb')
  return <primitive object={scene} position={position} scale={2} rotation={[0, Math.PI / 2, 0]} castShadow />
}

/** Workbench — decorative, back wall under picture frame */
function WorkbenchModel({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/workbench.glb')
  return <primitive object={scene} position={position} scale={0.012} castShadow />
}

/** Garage tools — decorative, right side near toolbox */
function GarageTools({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/garage_tools.glb')
  return <primitive object={scene} position={position} scale={1.5} castShadow />
}

/** Car jack — decorative, right side */
function CarJack({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/car_jack.glb')
  return <primitive object={scene} position={position} scale={0.7} rotation={[0, -Math.PI / 6, 0]} castShadow />
}

/** Trash can — decorative, near oil drums */
function TrashCan({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/trash_can.glb')
  return <primitive object={scene} position={position} scale={0.8} castShadow />
}

/** WD-40 can — decorative, near retro oil */
function WD40({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/wd-40.glb')
  return <primitive object={scene} position={position} scale={2.2} castShadow />
}

/** Dirty rag — decorative, near retro oil */
function DirtyRag({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/dirty_rag.glb')
  return <primitive object={scene} position={position} scale={0.4} castShadow />
}

/** Bucket — decorative, near tires */
function Bucket({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/bucket.glb')
  return <primitive object={scene} position={position} scale={0.21} castShadow />
}

/** Air compressor — decorative, near right wall */
function AirCompressor({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/air_compressor.glb')
  return <primitive object={scene} position={position} scale={1.5} castShadow />
}

/** Extension cord — decorative, on the floor */
function ExtensionCord({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/extension_cord.glb')
  return <primitive object={scene} position={position} scale={0.9} castShadow />
}

/** Mexican flag .glb model on the wall */
function MexicanFlag({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/mexican_flag.glb')
  return <primitive object={scene} position={position} scale={0.25} castShadow />
}


/** FIFA trophy — decorative, on workbench */
function FifaTrophy({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/fifa_trophy.glb')
  return <primitive object={scene} position={position} scale={0.4} castShadow />
}

/** Gold trophy — decorative, on workbench */
function GoldTrophy({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/gold_trophy.glb')
  return <primitive object={scene} position={position} scale={0.45} castShadow />
}

/** MLB trophy — decorative, on workbench */
function MLBTrophy({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/mlb_trophy.glb')
  return <primitive object={scene} position={position} scale={0.1} castShadow />
}

/** Retro oil .glb model — decorative */
function RetroOil({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/retro_oil.glb')
  return <primitive object={scene} position={position} scale={0.3} castShadow />
}

/** Python logo — decorative, floor near toolbox */
function PythonLogo({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/python_logo.glb')
  return <primitive object={scene} position={position} scale={0.01} rotation={[-Math.PI / 2, 0, 0.3]} castShadow />
}

/** Java logo — decorative, floor near toolbox */
function JavaLogo({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/java_logo.glb')
  return <primitive object={scene} position={position} scale={0.13} rotation={[0, -0.5, 0]} castShadow />
}

/** React logo — decorative, floor near toolbox */
function ReactLogo({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/react_logo.glb')
  return <primitive object={scene} position={position} scale={0.15} rotation={[-Math.PI / 2, 0, 0.8]} castShadow />
}

/** LinkedIn logo — clickable, opens LinkedIn profile */
function LinkedInLogo({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/linkedin_logo.glb')
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material && 'emissive' in mesh.material) {
          const stdMat = mesh.material as THREE.MeshStandardMaterial
          stdMat.emissive = new THREE.Color(stdMat.color ?? '#F4C963')
        }
      }
    })
  }, [scene])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const target = hovered ? 1.05 : 1
    groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), delta * 8)
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
        if (mat && 'emissiveIntensity' in mat) {
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, hovered ? 0.4 : 0.05, delta * 8)
        }
      }
    })
  })

  return (
    <group ref={groupRef} position={position}>
      <group
        onPointerOver={(e: any) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
        onClick={(e: any) => { e.stopPropagation(); window.open('https://www.linkedin.com/in/bryanrg22', '_blank') }}
      >
        <primitive
          object={scene}
          scale={0.21}
          rotation={[-Math.PI / 2, 0, 0.4]}
          castShadow
        />
        {/* Invisible hitbox for reliable pointer events */}
        <mesh visible={false} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.6, 0.6, 0.15]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
      {hovered && (
        <Html position={[0, 0.3, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-md bg-garage-dark/90 px-3 py-1.5 font-serif text-sm text-golden shadow-lg backdrop-blur-sm">
            LinkedIn
          </div>
        </Html>
      )}
    </group>
  )
}

/** GitHub logo — clickable, opens GitHub profile */
function GitHubLogo({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/github_logo.glb')
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.material = new THREE.MeshStandardMaterial({
          color: '#1a1a1a',
          roughness: 0.4,
          metalness: 0.1,
        })
      }
    })
  }, [scene])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const target = hovered ? 1.08 : 1
    groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), delta * 8)
  })

  return (
    <group ref={groupRef} position={position}>
      <primitive
        object={scene}
        scale={0.005}
        rotation={[-Math.PI / 2 + 0.3, -Math.PI / 2 + 0.8, 0.2]}
        castShadow
        onPointerOver={(e: any) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
        onClick={(e: any) => { e.stopPropagation(); window.open('https://github.com/bryanrg22', '_blank') }}
      />
      {hovered && (
        <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-md bg-garage-dark/90 px-3 py-1.5 font-serif text-sm text-golden shadow-lg backdrop-blur-sm">
            GitHub
          </div>
        </Html>
      )}
    </group>
  )
}

/** Resume paper — clickable, opens resume PDF */
function ResumePaper({ position }: { position: [number, number, number] }) {
  const texture = useTexture('/images/resume_image.png')
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const target = hovered ? 1.05 : 1
    groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), delta * 8)
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, hovered ? 0.3 : 0.0, delta * 8)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
        onPointerOver={(e: any) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
        onClick={(e: any) => { e.stopPropagation(); window.open('/resume.pdf', '_blank') }}
      >
        <planeGeometry args={[0.7, 0.9]} />
        <meshStandardMaterial
          map={texture}
          emissive="#F4C963"
          emissiveIntensity={0.0}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      {hovered && (
        <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-md bg-garage-dark/90 px-3 py-1.5 font-serif text-sm text-golden shadow-lg backdrop-blur-sm">
            Resume
          </div>
        </Html>
      )}
    </group>
  )
}

/** Corrugated wall panel — PBR chipboard texture with vertical ridges via InstancedMesh */
function CorrugatedWall({
  position,
  rotation = [0, 0, 0],
  width,
  height,
  color = '#3a3530',
  textureRepeat = [3, 3] as [number, number],
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  width: number
  height: number
  color?: string
  textureRepeat?: [number, number]
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const ridgeCount = Math.floor(width / 0.25)

  const colorTex = useTexture('/chipboard_wall/Chipboard002_1K-JPG_Color.jpg')
  const normalTex = useTexture('/chipboard_wall/Chipboard002_1K-JPG_NormalGL.jpg')
  const roughnessTex = useTexture('/chipboard_wall/Chipboard002_1K-JPG_Roughness.jpg')

  const [colorMap, normalMap, roughnessMap] = useMemo(() => {
    const c = colorTex.clone()
    const n = normalTex.clone()
    const r = roughnessTex.clone()
    for (const tex of [c, n, r]) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping
      tex.repeat.set(textureRepeat[0], textureRepeat[1])
      tex.needsUpdate = true
    }
    return [c, n, r]
  }, [colorTex, normalTex, roughnessTex, textureRepeat])

  useEffect(() => {
    if (!meshRef.current) return
    const dummy = new THREE.Object3D()
    for (let i = 0; i < ridgeCount; i++) {
      dummy.position.set(
        -width / 2 + (i + 0.5) * (width / ridgeCount),
        0,
        0.01,
      )
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [ridgeCount, width])

  return (
    <group position={position} rotation={rotation}>
      {/* Base panel — PBR chipboard texture */}
      <mesh receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          color="#777777"
          metalness={0.1}
        />
      </mesh>
      {/* Ridges — single instanced draw call */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, ridgeCount]} receiveShadow>
        <boxGeometry args={[0.04, height, 0.025]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.45} />
      </instancedMesh>
    </group>
  )
}

/** Tire stack — 2-3 tires stacked */
function TireStack({ position, count = 3 }: { position: [number, number, number]; count?: number }) {
  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.22, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.22, 0.1, 12, 24]} />
          <meshStandardMaterial color="#121212" roughness={0.95} metalness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

/** Oil drum */
function OilDrum({ position, color = '#3d5a3d' }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.8, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Top rim */}
      <mesh position={[0, 0.41, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.02, 16]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Bottom rim */}
      <mesh position={[0, -0.41, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.02, 16]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Band detail */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.03, 16]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  )
}

/** Shop fluorescent light fixture */
function ShopLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Housing */}
      <mesh>
        <boxGeometry args={[1.8, 0.06, 0.25]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Tube 1 */}
      <mesh position={[0, -0.04, -0.04]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fffaf0"
          emissiveIntensity={1.2}
        />
      </mesh>
      {/* Tube 2 */}
      <mesh position={[0, -0.04, 0.04]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fffaf0"
          emissiveIntensity={1.2}
        />
      </mesh>
      {/* Light source */}
      <pointLight
        position={[0, -0.15, 0]}
        intensity={0.4}
        color="#fffaf0"
        distance={5}
        decay={2}
      />
    </group>
  )
}

/** Garage roll-up door with segmented panels */
function GarageDoor({ position }: { position: [number, number, number] }) {
  const panelCount = 5
  const panelHeight = 0.8
  const doorWidth = 8
  return (
    <group position={position}>
      {/* Door frame — thick metal */}
      <mesh position={[-doorWidth / 2 - 0.15, panelCount * panelHeight / 2, 0]}>
        <boxGeometry args={[0.3, panelCount * panelHeight + 0.4, 0.15]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[doorWidth / 2 + 0.15, panelCount * panelHeight / 2, 0]}>
        <boxGeometry args={[0.3, panelCount * panelHeight + 0.4, 0.15]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Door panels — rolled up at top */}
      {Array.from({ length: panelCount }).map((_, i) => (
        <mesh
          key={i}
          position={[0, panelCount * panelHeight - i * 0.12, -0.05 - i * 0.03]}
          castShadow
        >
          <boxGeometry args={[doorWidth, panelHeight * 0.15, 0.04]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#3a3a3a' : '#444444'}
            roughness={0.6}
            metalness={0.5}
          />
        </mesh>
      ))}
      {/* Door track rails */}
      <mesh position={[-doorWidth / 2 + 0.1, 2, -0.1]}>
        <boxGeometry args={[0.05, 4, 0.05]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[doorWidth / 2 - 0.1, 2, -0.1]}>
        <boxGeometry args={[0.05, 4, 0.05]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export default function Garage() {
  return (
    <group>
      {/* ====== FLOOR ====== */}
      {/* Concrete floor — PBR textured */}
      <Suspense fallback={
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[14, 14]} />
          <meshStandardMaterial color="#4a4640" roughness={0.75} metalness={0.15} />
        </mesh>
      }>
        <ConcreteFloor />
      </Suspense>
      {/* Floor oil stain — dark patch near center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, 0.002, 1]} receiveShadow>
        <circleGeometry args={[0.8, 24]} />
        <meshStandardMaterial color="#2a2520" roughness={0.95} metalness={0.05} opacity={0.6} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.5, 0.002, 2.5]} receiveShadow>
        <circleGeometry args={[0.4, 24]} />
        <meshStandardMaterial color="#2a2520" roughness={0.95} metalness={0.05} opacity={0.4} transparent />
      </mesh>
      {/* Floor safety stripe — yellow caution line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 4.5]}>
        <planeGeometry args={[10, 0.1]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.8} emissive="#C9A84C" emissiveIntensity={0.1} />
      </mesh>

      {/* ====== WALLS ====== */}
      {/* Back wall — corrugated metal */}
      <CorrugatedWall
        position={[0, 2.5, -3]}
        rotation={[0, 0, 0]}
        width={14}
        height={5}
        color="#2e2822"
        textureRepeat={[6, 3]}
      />

      {/* Left wall — corrugated metal */}
      <CorrugatedWall
        position={[-5, 2.5, 2]}
        rotation={[0, Math.PI / 2, 0]}
        width={14}
        height={5}
        color="#322c26"
        textureRepeat={[3, 3]}
      />

      {/* Right wall — corrugated metal */}
      <CorrugatedWall
        position={[5, 2.5, 2]}
        rotation={[0, -Math.PI / 2, 0]}
        width={14}
        height={5}
        color="#322c26"
        textureRepeat={[3, 3]}
      />

      {/* Wall baseboard / kick plate — metal strip along bottom of walls */}
      <mesh position={[0, 0.15, -2.97]}>
        <boxGeometry args={[14, 0.3, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[-4.97, 0.15, 2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[14, 0.3, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[4.97, 0.15, 2]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[14, 0.3, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* ====== CEILING ====== */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 2]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#1e1c18" roughness={0.95} metalness={0.1} />
      </mesh>

      {/* Ceiling beams / rafters — exposed steel I-beams */}
      {[-3, 0, 3].map((x) => (
        <group key={`beam-${x}`}>
          {/* Bottom flange */}
          <mesh position={[x, 4.85, 2]}>
            <boxGeometry args={[0.3, 0.04, 14]} />
            <meshStandardMaterial color="#3a3530" roughness={0.5} metalness={0.6} />
          </mesh>
          {/* Web */}
          <mesh position={[x, 4.92, 2]}>
            <boxGeometry args={[0.06, 0.12, 14]} />
            <meshStandardMaterial color="#3a3530" roughness={0.5} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* ====== GARAGE DOOR — front wall opening ====== */}
      <GarageDoor position={[0, 0, 5.5]} />

      {/* Front wall — panels on either side of the door opening */}
      <CorrugatedWall
        position={[-6.2, 2.5, 5.5]}
        rotation={[0, 0, 0]}
        width={3}
        height={5}
        color="#2e2822"
        textureRepeat={[2, 3]}
      />
      <CorrugatedWall
        position={[6.2, 2.5, 5.5]}
        rotation={[0, 0, 0]}
        width={3}
        height={5}
        color="#2e2822"
        textureRepeat={[2, 3]}
      />

      {/* ====== LEFT WALL — UPPER ====== */}
      {/* USC Trojan logo */}
      <USCTrojanSign />
      {/* Azusa city logo — to the left of USC */}
      <AzusaCitySign />
      {/* California flag — under Azusa, above oil drums */}
      <CaliforniaFlag />

      {/* ====== RIGHT WALL — UPPER ====== */}
      {/* MLH logo */}
      <MLHSign />

      {/* ====== BACK WALL — UPPER ====== */}
      {/* Mexican flag — left of sign */}
      <Suspense fallback={null}>
        <MexicanFlag position={[-3.5, 3.5, -2.85]} />
      </Suspense>

      {/* Brea Auto Body sign — centered */}
      <BreaBoardSign />

      {/* Wall clock — far right */}
      <group position={[4.2, 3.8, -2.95]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.04, 24]} />
          <meshStandardMaterial color="#222" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <circleGeometry args={[0.22, 24]} />
          <meshStandardMaterial color="#d5d0c0" roughness={0.9} />
        </mesh>
      </group>

      {/* Electrical conduit — pipe running along back wall */}
      <mesh position={[-3, 4.2, -2.95]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 4, 8]} />
        <meshStandardMaterial color="#666" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Electrical box */}
      <mesh position={[-4.5, 4.2, -2.93]} castShadow>
        <boxGeometry args={[0.3, 0.35, 0.1]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* ====== WORKBENCH — back wall, under picture frame ====== */}
      <Suspense fallback={null}>
        <WorkbenchModel position={[0.9, -0.1, -2.7]} />
      </Suspense>

      {/* ====== SHOP LIGHTS (reduced from 3 to 2) ====== */}
      <ShopLight position={[-2.5, 4.8, 0]} />
      <ShopLight position={[2.5, 4.8, 0]} />

      {/* ====== WORKBENCH — left side ====== */}
      {/* Tabletop */}
      <mesh position={[-2.9, 1.0, -1]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.08, 1.2]} />
        <meshStandardMaterial color="#5a4f42" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Metal frame legs */}
      {[[-4.3, -0.5], [-4.3, -1.5], [-1.5, -0.5], [-1.5, -1.5]].map(([x, z], i) => (
        <mesh key={`wbleg-${i}`} position={[x, 0.48, z]} castShadow>
          <boxGeometry args={[0.06, 0.96, 0.06]} />
          <meshStandardMaterial color="#444" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      {/* Lower shelf on workbench */}
      <mesh position={[-2.9, 0.35, -1]} receiveShadow>
        <boxGeometry args={[3.0, 0.04, 1.0]} />
        <meshStandardMaterial color="#3a3530" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* ====== JANE STREET LOGO — back wall, behind workbench ====== */}
      <JaneStreetSign />

      {/* ====== HARVARD & CALTECH LOGOS — back wall, above trophies ====== */}
      <HarvardSign />
      <CaltechSign />

      {/* ====== FIFA TROPHY — on workbench, right side ====== */}
      <Suspense fallback={null}>
        <FifaTrophy position={[1.98, 1.46, -2.5]} />
      </Suspense>

      {/* ====== GOLD TROPHY — on workbench, next to FIFA ====== */}
      <Suspense fallback={null}>
        <GoldTrophy position={[2.43, 1.41, -2.5]} />
      </Suspense>

      {/* ====== MLB TROPHY — on workbench, next to gold ====== */}
      <Suspense fallback={null}>
        <MLBTrophy position={[2.9, 1.57, -2.5]} />
      </Suspense>

      {/* ====== NVIDIA LOGO — on workbench, near macbook ====== */}
      <Suspense fallback={null}>
        <NvidiaLogo position={[-3.25, 1.4, -0.7]} />
      </Suspense>

      {/* ====== AMAZON LOGO — on workbench, behind nvidia ====== */}
      <Suspense fallback={null}>
        <AmazonLogo position={[-2.85, 1.36, -1.1]} />
      </Suspense>

      {/* ====== RED BULL CAN — on workbench ====== */}
      <Suspense fallback={null}>
        <RedBullCan position={[-1.45, 1.21, -1.1]} />
      </Suspense>

      {/* ====== RETRO OIL — under workbench ====== */}
      <Suspense fallback={null}>
        <RetroOil position={[-3, 0.0, 0.5]} />
      </Suspense>

      {/* ====== WD-40 — near retro oil ====== */}
      <Suspense fallback={null}>
        <WD40 position={[-2.5, 0, 0.5]} />
      </Suspense>

      {/* ====== DIRTY RAG — near retro oil ====== */}
      <Suspense fallback={null}>
        <DirtyRag position={[-3.5, 0, 0.8]} />
      </Suspense>

      {/* ====== TIRE STACKS — right front corner ====== */}
      <TireStack position={[4.3, 0.1, 3.5]} count={3} />
      <TireStack position={[4.3, 0.1, 2.5]} count={2} />

      {/* ====== OIL DRUMS — left wall near workbench ====== */}
      <OilDrum position={[-4.5, 0.4, 0]} color="#3d5a3d" />
      <OilDrum position={[-4.5, 0.4, 1]} color="#6e3610" />

      {/* ====== DRIP PAN — near car lift ====== */}
      <mesh position={[2.5, 0.01, 1.2]} receiveShadow>
        <boxGeometry args={[1, 0.02, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* ====== FIRE EXTINGUISHER — left wall ====== */}
      <group position={[-4.9, 1.2, -0.5]}>
        <mesh rotation={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 12]} />
          <meshStandardMaterial color="#992222" roughness={0.6} metalness={0.2} />
        </mesh>
        {/* Nozzle */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.1, 8]} />
          <meshStandardMaterial color="#222" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* ====== TRASH CAN — in front of oil drums ====== */}
      <Suspense fallback={null}>
        <TrashCan position={[-2.8, 0.25, 1.85]} />
      </Suspense>

      {/* ====== BUCKET — next to tires ====== */}
      <Suspense fallback={null}>
        <Bucket position={[3.5, 0, 3.5]} />
      </Suspense>


      {/* ====== PROGRAMMING LOGOS — floor, in front of toolbox ====== */}
      <Suspense fallback={null}>
        <PythonLogo position={[1.3, 0.05, 1.16]} />
      </Suspense>
      <Suspense fallback={null}>
        <JavaLogo position={[2.2, 0.18, 1.6]} />
      </Suspense>
      <Suspense fallback={null}>
        <ReactLogo position={[2.7, 0.05, 1.1]} />
      </Suspense>

      {/* ====== SOCIAL LOGOS — floor, front-center, clickable ====== */}
      <Suspense fallback={null}>
        <LinkedInLogo position={[-0.5, -1.17, 4]} />
      </Suspense>
      <Suspense fallback={null}>
        <GitHubLogo position={[-0.1, 0.02, 3.2]} />
      </Suspense>
      <Suspense fallback={null}>
        <ResumePaper position={[0.7, 0.01, 3.1]} />
      </Suspense>

      {/* ====== GARAGE TOOLS — right side, near toolbox ====== */}
      <Suspense fallback={null}>
        <GarageTools position={[1.9, 0, 1.5]} />
      </Suspense>

      {/* ====== CAR JACK — right side ====== */}
      <Suspense fallback={null}>
        <CarJack position={[3.75, 0, 1]} />
      </Suspense>

      {/* ====== AIR COMPRESSOR — right wall ====== */}
      <Suspense fallback={null}>
        <AirCompressor position={[3.8, 0, -1]} />
      </Suspense>

      {/* ====== EXTENSION CORD — on the floor ====== */}
      <Suspense fallback={null}>
        <ExtensionCord position={[-2, 0, 1.5]} />
      </Suspense>

      {/* ====== LIGHTING (reduced from 11 to 8) ====== */}

      {/* Main warm directional — sun streaming through open garage door */}
      <directionalLight
        position={[3, 6, 8]}
        intensity={2.5}
        color="#F4C963"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-far={25}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* Secondary warm directional — fill from door opening */}
      <directionalLight
        position={[-2, 4, 8]}
        intensity={1.0}
        color="#E8A838"
      />

      {/* Warm fill ambient */}
      <ambientLight intensity={0.5} color="#E8A838" />

      {/* Cool accent — workbench area */}
      <pointLight position={[-3, 2.5, 0]} intensity={0.5} color="#5B9BD5" distance={6} />

      {/* Warm center area */}
      <pointLight position={[0, 3, 2]} intensity={0.8} color="#F4C963" distance={10} />

      {/* Back fill — prevents pure black */}
      <hemisphereLight args={['#F4C963', '#2a2420', 0.4]} />

      {/* Car lift spotlight */}
      <pointLight position={[2, 2.5, 0.5]} intensity={0.5} color="#F4C963" distance={4} decay={2} />
    </group>
  )
}
