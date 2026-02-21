import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { generateLinearSpace, generateCubeSpace } from '@/engine/ColorSpaceEngine';
import type { InterpolationMode } from '@/engine/ColorSpaceEngine';

interface LinearVisualizationProps {
  fromColor: string;
  toColor: string;
  steps: number;
  interpolation: InterpolationMode;
}

interface CubeVisualizationProps {
  corners: Record<string, string>;
  stepsPerAxis: number;
  interpolation: InterpolationMode;
}

type ColorSpaceViewer3DProps =
  | { type: 'linear' } & LinearVisualizationProps
  | { type: 'cube' } & CubeVisualizationProps;

/* ───── Linear: spheres along a curved line ───── */

function LinearScene({ fromColor, toColor, steps, interpolation }: LinearVisualizationProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const colors = useMemo(
    () => generateLinearSpace(fromColor, toColor, steps, interpolation),
    [fromColor, toColor, steps, interpolation],
  );

  const positions = useMemo(() => {
    const pts: [number, number, number][] = [];
    const total = colors.length;
    for (let i = 0; i < total; i++) {
      const t = total === 1 ? 0.5 : i / (total - 1);
      const x = (t - 0.5) * 6;
      const y = Math.sin(t * Math.PI) * 1.5;
      const z = Math.cos(t * Math.PI) * 1.5 - 1.5;
      pts.push([x, y, z]);
    }
    return pts;
  }, [colors.length]);

  return (
    <group ref={groupRef}>
      {colors.map((hex, i) => (
        <mesh key={i} position={positions[i]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={hex} />
        </mesh>
      ))}
      {/* Line connecting the spheres */}
      {positions.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length}
              array={new Float32Array(positions.flat())}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#888888" opacity={0.4} transparent />
        </line>
      )}
    </group>
  );
}

/* ───── Cube: small cubes in a 3D grid ───── */

function CubeScene({ corners, stepsPerAxis, interpolation }: CubeVisualizationProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const cornerColors = useMemo(
    () => {
      const keys = Object.keys(corners);
      return keys.map((k) => corners[k]) as [string, string, string, string, string, string, string, string];
    },
    [corners],
  );

  const palette = useMemo(
    () => generateCubeSpace(cornerColors, stepsPerAxis, interpolation),
    [cornerColors, stepsPerAxis, interpolation],
  );

  const cubeSize = 0.35;
  const spacing = cubeSize * 1.6;

  const instances = useMemo(() => {
    const items: { pos: [number, number, number]; color: string }[] = [];
    let idx = 0;
    const offset = ((stepsPerAxis - 1) * spacing) / 2;
    for (let xi = 0; xi < stepsPerAxis; xi++) {
      for (let yi = 0; yi < stepsPerAxis; yi++) {
        for (let zi = 0; zi < stepsPerAxis; zi++) {
          items.push({
            pos: [
              xi * spacing - offset,
              yi * spacing - offset,
              zi * spacing - offset,
            ],
            color: palette[idx++],
          });
        }
      }
    }
    return items;
  }, [palette, stepsPerAxis, spacing]);

  return (
    <group ref={groupRef}>
      {instances.map((item, i) => (
        <mesh key={i} position={item.pos}>
          <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
          <meshStandardMaterial color={item.color} />
        </mesh>
      ))}
    </group>
  );
}

/* ───── Main wrapper ───── */

const ColorSpaceViewer3D: React.FC<ColorSpaceViewer3DProps> = (props) => {
  return (
    <div className="w-full h-full overflow-hidden bg-[#1a1a2e]">
      <Canvas camera={{ position: [4, 3, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <OrbitControls enableDamping dampingFactor={0.1} />
        {props.type === 'linear' ? (
          <LinearScene
            fromColor={props.fromColor}
            toColor={props.toColor}
            steps={props.steps}
            interpolation={props.interpolation}
          />
        ) : (
          <CubeScene
            corners={props.corners}
            stepsPerAxis={props.stepsPerAxis}
            interpolation={props.interpolation}
          />
        )}
      </Canvas>
    </div>
  );
};

export default ColorSpaceViewer3D;
