import React from 'react';
import { Composition, getInputProps, registerRoot } from 'remotion';
import { Reel } from './compositions/Reel';
import type { ReelProps } from '../src/lib/types';

const FALLBACK: ReelProps = {
  videoSrc: '',
  audioSrc: '',
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: 300,
  captions: [],
  faceTrack: { version: 1, frames: [], frozenIntervals: [] },
  beats: [],
  inserts: [],
  transitions: [],
};

export const RemotionRoot: React.FC = () => {
  // Props are injected via --props=<file>. getInputProps lets Studio preview.
  const input = getInputProps() as Partial<ReelProps>;
  const props: ReelProps = { ...FALLBACK, ...input };
  return (
    <Composition
      id="Reel"
      component={Reel as unknown as React.FC<Record<string, unknown>>}
      durationInFrames={props.durationInFrames}
      fps={props.fps}
      width={props.width}
      height={props.height}
      defaultProps={props as unknown as Record<string, unknown>}
    />
  );
};

registerRoot(RemotionRoot);
