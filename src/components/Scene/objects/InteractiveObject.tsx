import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { PortfolioItem } from '../../../data/portfolio'
import { useStore } from '../../../stores/useStore'
import { useIsMobile } from '../../../hooks/useIsMobile'

interface InteractiveObjectProps {
  item: PortfolioItem
  children?: React.ReactNode
}

/** Returns a shape config based on the object type */
function useObjectShape(id: string) {
  return useMemo(() => {
    switch (id) {
      case 'projects':
        return { type: 'car' as const, labelY: 0.9 }
      case 'hackathons':
        return { type: 'invisible' as const, labelY: 0.4 }
      case 'soccer':
        return { type: 'sphere' as const, labelY: 0.6 }
      case 'skills':
        return { type: 'toolbox' as const, labelY: 1.0 }
      case 'experience':
        return { type: 'invisible' as const, labelY: 0.6 }
      case 'education':
        return { type: 'invisible' as const, labelY: 0.8 }
      case 'home':
        return { type: 'invisible' as const, labelY: 1.0 }
      case 'cultura':
        return { type: 'invisible' as const, labelY: 0.6 }
      case 'about':
        return { type: 'invisible' as const, labelY: 0.8 }
      case 'boombox':
        return { type: 'boombox' as const, labelY: 0.7 }
      case 'awards':
        return { type: 'invisible' as const, labelY: 1.2 }
      default:
        return { type: 'box' as const, labelY: 0.8 }
    }
  }, [id])
}

function ObjectGeometry({ id, color, hovered }: { id: string; color: string; hovered: boolean }) {
  const emissiveIntensity = hovered ? 0.4 : 0.05
  const mat = { color, emissive: color, emissiveIntensity, roughness: 0.6, metalness: 0.2 }
  const matDark = { color: '#2a2420', emissive: color, emissiveIntensity: emissiveIntensity * 0.3, roughness: 0.8, metalness: 0.3 }

  switch (id) {
    case 'projects':
      // Car body on lift posts
      return (
        <group>
          {/* Car body */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[1.8, 0.5, 0.9]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          {/* Cabin */}
          <mesh position={[0.1, 0.65, 0]} castShadow>
            <boxGeometry args={[0.9, 0.3, 0.75]} />
            <meshStandardMaterial {...mat} metalness={0.4} />
          </mesh>
          {/* Lift posts */}
          {[[-0.7, 0, -0.35], [-0.7, 0, 0.35], [0.7, 0, -0.35], [0.7, 0, 0.35]].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
              <meshStandardMaterial color="#666" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )

    case 'hackathons':
      // Invisible hitbox over MLH banner
      return (
        <mesh visible={false}>
          <boxGeometry args={[2.2, 1.2, 0.5]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )

    case 'soccer':
      // Sphere
      return (
        <mesh castShadow>
          <sphereGeometry args={[0.25, 24, 24]} />
          <meshStandardMaterial {...mat} roughness={0.85} metalness={0.05} />
        </mesh>
      )

    case 'skills':
      // Pegboard — vertical board with hooks and hanging tool silhouettes
      return (
        <group>
          {/* Board */}
          <mesh castShadow>
            <boxGeometry args={[1.2, 1.0, 0.06]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          {/* Pegboard holes — grid of small indentations */}
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 7 }).map((_, col) => (
              <mesh
                key={`peg-${row}-${col}`}
                position={[
                  -0.45 + col * 0.15,
                  0.3 - row * 0.2,
                  0.035,
                ]}
              >
                <cylinderGeometry args={[0.015, 0.015, 0.02, 8]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
              </mesh>
            )),
          )}
          {/* Hook 1 — wrench silhouette (L-shape) */}
          <group position={[-0.3, 0.2, 0.06]}>
            <mesh castShadow>
              <boxGeometry args={[0.04, 0.3, 0.03]} />
              <meshStandardMaterial {...matDark} metalness={0.6} />
            </mesh>
            <mesh position={[0.06, -0.13, 0]} castShadow>
              <boxGeometry args={[0.12, 0.04, 0.03]} />
              <meshStandardMaterial {...matDark} metalness={0.6} />
            </mesh>
          </group>
          {/* Hook 2 — screwdriver (vertical bar + handle) */}
          <group position={[0, 0.15, 0.06]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.35, 8]} />
              <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.2, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.025, 0.1, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity * 0.5} roughness={0.5} />
            </mesh>
          </group>
          {/* Hook 3 — pliers (two angled bars meeting at a point) */}
          <group position={[0.3, 0.2, 0.06]}>
            <mesh position={[-0.02, 0, 0]} rotation={[0, 0, 0.1]} castShadow>
              <boxGeometry args={[0.03, 0.28, 0.025]} />
              <meshStandardMaterial {...matDark} metalness={0.6} />
            </mesh>
            <mesh position={[0.02, 0, 0]} rotation={[0, 0, -0.1]} castShadow>
              <boxGeometry args={[0.03, 0.28, 0.025]} />
              <meshStandardMaterial {...matDark} metalness={0.6} />
            </mesh>
          </group>
          {/* Hook 4 — hammer (bottom row) */}
          <group position={[-0.15, -0.2, 0.06]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
              <meshStandardMaterial color="#5a4a38" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.14, 0]} castShadow>
              <boxGeometry args={[0.12, 0.05, 0.04]} />
              <meshStandardMaterial {...matDark} metalness={0.5} />
            </mesh>
          </group>
          {/* Hook 5 — socket wrench (bottom row) */}
          <group position={[0.2, -0.2, 0.06]}>
            <mesh castShadow>
              <boxGeometry args={[0.04, 0.22, 0.03]} />
              <meshStandardMaterial {...matDark} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.12, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
              <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        </group>
      )

    case 'experience':
      // Invisible hitbox over NVIDIA/Amazon logos
      return (
        <mesh visible={false}>
          <boxGeometry args={[1.0, 0.5, 0.8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )

    case 'education':
      // Invisible hitbox over USC Trojan logo on left wall
      return (
        <mesh visible={false} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.3, 1.3, 0.3]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )

    case 'home':
      // Invisible hitbox over Azusa sign and California flag on left wall
      return (
        <mesh visible={false} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.3, 2.0, 0.3]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )

    case 'cultura':
      // Invisible hitbox over Mexican flag on back wall
      return (
        <mesh visible={false}>
          <boxGeometry args={[1.9, 1.0, 0.3]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )

    case 'about':
      // Invisible hitbox over Brea Auto Body sign on back wall
      return (
        <mesh visible={false}>
          <boxGeometry args={[3.5, 1.2, 0.3]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )

    case 'awards':
      // Invisible hitbox over trophy area
      return (
        <mesh visible={false}>
          <boxGeometry args={[1.5, 2.0, 0.8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )


    case 'boombox':
      // Wide box with two speaker circles
      return (
        <group>
          {/* Main body */}
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.45, 0.35]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          {/* Left speaker */}
          <mesh position={[-0.25, 0, 0.18]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          {/* Right speaker */}
          <mesh position={[0.25, 0, 0.18]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          {/* Handle */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.5, 0.04, 0.06]} />
            <meshStandardMaterial color="#666" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      )

    default:
      return (
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      )
  }
}

const goldenColor = new THREE.Color('#F4C963')

export default function InteractiveObject({ item, children }: InteractiveObjectProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const setActiveItem = useStore((s) => s.setActiveItem)
  const setHasInteracted = useStore((s) => s.setHasInteracted)
  const activeItem = useStore((s) => s.activeItem)
  const isActive = activeItem?.id === item.id
  const shape = useObjectShape(item.id)
  const isMobile = useIsMobile()
  const dotRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    if (isMobile && !isActive) {
      // Mobile: subtle pulse animation
      const pulse = 1 + Math.sin(state.clock.elapsedTime * Math.PI) * 0.015
      groupRef.current.scale.setScalar(pulse)
    } else {
      // Desktop: hover scale lerp
      const targetScale = hovered && !isActive ? 1.05 : 1
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        delta * 8,
      )
    }

    // Golden dot pulse on mobile
    if (dotRef.current && isMobile && !isActive) {
      const dotPulse = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.5
      const mat = dotRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = dotPulse * 0.8
    }
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setActiveItem(item)
    setHasInteracted()
  }

  return (
    <group ref={groupRef} position={item.position}>
      <group
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
      >
        {children ? (
          <group>
            {children}
            {/* Invisible hitbox so GLB models reliably capture pointer events */}
            <mesh visible={false}>
              <boxGeometry args={[0.75, 1.5, 0.75]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </group>
        ) : (
          <ObjectGeometry id={item.id} color={item.color} hovered={hovered} />
        )}
      </group>

      {/* Mobile: golden dot marker above objects */}
      {isMobile && !isActive && (
        <mesh
          ref={dotRef}
          position={[0, shape.labelY + 0.15, 0]}
        >
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color={goldenColor}
            emissive={goldenColor}
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Hover label (desktop only) */}
      {!isMobile && hovered && !isActive && (
        <Html
          position={[0, shape.labelY, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="whitespace-nowrap rounded-md bg-garage-dark/90 px-3 py-1.5 font-serif text-sm text-golden shadow-lg backdrop-blur-sm">
            {item.title}
          </div>
        </Html>
      )}
    </group>
  )
}
