import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {HAS_CUSTOM_MUSIC, HAS_VOICEOVER} from './audioManifest';
import {DRAW_WINDOWS, ERASE_FRAMES, TAK_FRAMES, TOTAL_FRAMES} from './timeline';

const RAMP = 4;

/** Volume du crayon : monte quand un trait ou un mot est en cours. */
const pencilVolume = (frame: number) => {
  let v = 0;
  for (const [a, b] of DRAW_WINDOWS) {
    if (frame < a - RAMP || frame > b + RAMP) continue;
    const up = interpolate(frame, [a - RAMP, a + RAMP], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const down = interpolate(frame, [b - RAMP, b + RAMP], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    v = Math.max(v, Math.min(up, down));
  }
  // leger tremblement pour eviter l'effet boucle mecanique
  return v * 0.1 * (0.82 + 0.18 * Math.sin(frame / 5.7));
};

export const Soundtrack: React.FC = () => (
  <>
    <Audio
      src={staticFile(HAS_CUSTOM_MUSIC ? 'audio/music.mp3' : 'audio/lofi_bed.mp3')}
      loop
      volume={(f) =>
        interpolate(
          f,
          [0, 18, TOTAL_FRAMES - 34, TOTAL_FRAMES],
          [0, 0.26, 0.26, 0],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
        )
      }
    />
    {HAS_VOICEOVER ? <Audio src={staticFile('audio/vo.mp3')} volume={1} /> : null}
    <Audio src={staticFile('audio/pencil_loop.mp3')} loop volume={pencilVolume} />
    {ERASE_FRAMES.map((f) => (
      <Sequence key={`e${f}`} from={f} durationInFrames={16}>
        <Audio src={staticFile('audio/erase.mp3')} volume={0.35} />
      </Sequence>
    ))}
    {TAK_FRAMES.map((f, i) => (
      <Sequence key={`t${f}-${i}`} from={f} durationInFrames={6}>
        <Audio src={staticFile('audio/tak.mp3')} volume={0.22} />
      </Sequence>
    ))}
  </>
);
