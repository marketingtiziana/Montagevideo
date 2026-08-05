import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { theme } from '../../theme';

/**
 * Shape3D — visual breather. A Three.js primitive in indigo wireframe, slow
 * rotation. Kept deliberately minimal (10.4): a shape, not a scene.
 */
export const Shape3D: React.FC<{ env: number }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <div style={{ width: '100%', height: 420 }}>
      <ThreeCanvas width={420} height={420} style={{ width: '100%', height: '100%' }} camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.6} />
        <mesh rotation={[t * 0.4, t * 0.6, 0]}>
          <icosahedronGeometry args={[1.4, 0]} />
          <meshBasicMaterial color={theme.colors.indigo} wireframe />
        </mesh>
      </ThreeCanvas>
    </div>
  );
};
