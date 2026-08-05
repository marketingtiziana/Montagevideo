import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import type { ReelProps, InsertPlan } from '../../src/lib/types.js';
import { theme } from '../theme.js';
import { FaceFrame } from '../components/FaceFrame.js';
import { Captions } from '../components/Captions.js';
import { Transitions } from '../components/Transitions.js';
import { InsertLayer } from '../components/InsertLayer.js';

/**
 * Reel — 1080x1920 @ 30fps. Layer order matters (section 10 / 14.6):
 *   1. dynamic framing (FaceFrame)   — the video, cropped to follow the face
 *   2. captions
 *   3. transitions (over joins)
 *   4. inserts (max one on screen at a time)
 */
export const Reel: React.FC<ReelProps> = (props) => {
  const { fps } = props;
  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.navy }}>
      {/* mastered audio replaces the raw track */}
      {props.audioSrc ? <Audio src={toSrc(props.audioSrc)} /> : null}

      {/* 1 — framing */}
      <FaceFrame
        videoSrc={props.videoSrc}
        faceTrack={props.faceTrack}
        beats={props.beats}
        fps={fps}
        width={props.width}
        height={props.height}
      />

      {/* 3 — transitions sit above the video, below captions/inserts */}
      <Transitions cues={props.transitions} fps={fps} width={props.width} height={props.height} />

      {/* 2 — captions */}
      <Captions groups={props.captions} fps={fps} height={props.height} />

      {/* 4 — inserts, one at a time, placed in the free zone */}
      {props.inserts.map((ins: InsertPlan, i: number) => (
        <Sequence
          key={i}
          from={Math.round(ins.start * fps)}
          durationInFrames={Math.max(1, Math.round(ins.duration * fps))}
        >
          <InsertLayer insert={ins} faceTrack={props.faceTrack} fps={fps} startFrame={Math.round(ins.start * fps)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** Absolute paths must be wrapped for Remotion; http(s) pass through. */
function toSrc(p: string): string {
  if (/^https?:\/\//.test(p) || p.startsWith('file://')) return p;
  return `file://${p}`;
}
