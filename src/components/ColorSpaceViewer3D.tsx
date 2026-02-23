import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
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
  | ({ type: 'linear'; onColorSelect?: (color: string) => void; selectedColor?: string | null } & LinearVisualizationProps)
  | ({ type: 'cube'; onColorSelect?: (color: string) => void; selectedColor?: string | null } & CubeVisualizationProps);

/* ───── Interactive sphere for linear scene ───── */

function InteractiveSphere({
  position,
  color,
  isSelected,
  onClick,
}: {
  position: [number, number, number];
  color: string;
  isSelected: boolean;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const radius = 0.2;
  const scale = hovered || isSelected ? 1.3 : 1;

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      onClick={onClick}
    >
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial color={color} />
      {(hovered || isSelected) && (
        <Edges scale={1} threshold={15} color="white" lineWidth={2} />
      )}
    </mesh>
  );
}

/* ───── Interactive cube box ───── */

function InteractiveBox({
  basePosition,
  targetPosition,
  color,
  size,
  isSelected,
  onClick,
}: {
  basePosition: [number, number, number];
  targetPosition: [number, number, number];
  color: string;
  size: number;
  isSelected: boolean;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const posRef = useRef(new THREE.Vector3(...basePosition));

  const scaleRef = useRef(1);

  useFrame(() => {
    if (meshRef.current) {
      posRef.current.lerp(new THREE.Vector3(...targetPosition), 0.1);
      meshRef.current.position.copy(posRef.current);
      const targetScale = isSelected ? 2 : 1;
      scaleRef.current += (targetScale - scaleRef.current) * 0.1;
      meshRef.current.scale.setScalar(scaleRef.current);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={basePosition}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      onClick={onClick}
    >
      <boxGeometry args={[size, size, size]} />
      <meshBasicMaterial color={color} />
      <Edges scale={1} threshold={15} color="black" lineWidth={0.5} opacity={0.15} transparent />
      {(hovered || isSelected) && (
        <Edges scale={1.01} threshold={15} color="black" lineWidth={0.5} opacity={0.5} transparent />
      )}
    </mesh>
  );
}

/* ───── Linear: spheres along a curved line ───── */

function LinearScene({
  fromColor, toColor, steps, interpolation,
  onColorSelect, selectedColor,
}: LinearVisualizationProps & { onColorSelect?: (color: string) => void; selectedColor?: string | null }) {
  const groupRef = useRef<THREE.Group>(null);

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

  const handleClick = useCallback((hex: string, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onColorSelect?.(hex);
  }, [onColorSelect]);

  return (
    <group ref={groupRef}>
      {colors.map((hex, i) => {
        const pos = positions[i];
        return (
          <mesh
            key={i}
            position={pos}
            scale={selectedColor === hex ? 1.3 : 1}
            onClick={(e) => handleClick(hex, e)}
          >
            <boxGeometry args={[0.25, 0.25, 0.25]} />
            <meshBasicMaterial color={hex} />
            <Edges scale={1} threshold={15} color="black" lineWidth={0.5} opacity={0.15} transparent />
            {selectedColor === hex && (
              <Edges scale={1.01} threshold={15} color="black" lineWidth={0.5} opacity={0.5} transparent />
            )}
          </mesh>
        );
      })}
      {/* Line connecting the cubes */}
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

function CubeScene({
  corners, stepsPerAxis, interpolation,
  onColorSelect, selectedColor,
}: CubeVisualizationProps & { onColorSelect?: (color: string) => void; selectedColor?: string | null }) {
  const groupRef = useRef<THREE.Group>(null);

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

  const cubeSize = 0.25;
  const spacing = 0.56;
  const expandedSpacing = 0.98;

  // Find selected index
  const selectedIndex = useMemo(() => {
    if (!selectedColor) return -1;
    return palette.indexOf(selectedColor);
  }, [palette, selectedColor]);

  // Compute grid coordinates for each instance
  const gridCoords = useMemo(() => {
    const coords: { xi: number; yi: number; zi: number }[] = [];
    for (let xi = 0; xi < stepsPerAxis; xi++) {
      for (let yi = 0; yi < stepsPerAxis; yi++) {
        for (let zi = 0; zi < stepsPerAxis; zi++) {
          coords.push({ xi, yi, zi });
        }
      }
    }
    return coords;
  }, [stepsPerAxis]);

  // Base positions (default state)
  const basePositions = useMemo(() => {
    const offset = ((stepsPerAxis - 1) * spacing) / 2;
    return gridCoords.map(({ xi, yi, zi }) => [
      xi * spacing - offset,
      yi * spacing - offset,
      zi * spacing - offset,
    ] as [number, number, number]);
  }, [gridCoords, stepsPerAxis, spacing]);

  // Target positions (expanded when a color is selected)
  const targetPositions = useMemo(() => {
    if (selectedIndex < 0) return basePositions;

    const expandedOffset = ((stepsPerAxis - 1) * expandedSpacing) / 2;

    return gridCoords.map(({ xi, yi, zi }) => [
      xi * expandedSpacing - expandedOffset,
      yi * expandedSpacing - expandedOffset,
      zi * expandedSpacing - expandedOffset,
    ] as [number, number, number]);
  }, [selectedIndex, gridCoords, basePositions, stepsPerAxis, spacing, expandedSpacing]);

  const handleClick = useCallback((hex: string, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onColorSelect?.(hex);
  }, [onColorSelect]);

  return (
    <group ref={groupRef}>
      {palette.map((color, i) => (
        <InteractiveBox
          key={i}
          basePosition={basePositions[i]}
          targetPosition={targetPositions[i]}
          color={color}
          size={cubeSize}
          isSelected={selectedColor === color}
          onClick={(e) => handleClick(color, e)}
        />
      ))}
    </group>
  );
}

/* ───── Main wrapper ───── */

const ColorSpaceViewer3D: React.FC<ColorSpaceViewer3DProps> = (props) => {
  return (
    <div className="w-full h-full overflow-hidden">
      <Canvas flat camera={{ position: [4, 3, 5], fov: 50 }} gl={{ alpha: true }} style={{ background: 'transparent' }}>
        <OrbitControls enableDamping dampingFactor={0.1} />
        {props.type === 'linear' ? (
          <LinearScene
            fromColor={props.fromColor}
            toColor={props.toColor}
            steps={props.steps}
            interpolation={props.interpolation}
            onColorSelect={props.onColorSelect}
            selectedColor={props.selectedColor}
          />
        ) : (
          <CubeScene
            corners={props.corners}
            stepsPerAxis={props.stepsPerAxis}
            interpolation={props.interpolation}
            onColorSelect={props.onColorSelect}
            selectedColor={props.selectedColor}
          />
        )}
      </Canvas>
    </div>
  );
};

export default ColorSpaceViewer3D;
