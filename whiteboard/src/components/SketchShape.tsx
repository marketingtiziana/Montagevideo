import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import type {Options} from 'roughjs/bin/core';
import {pointAt, samplePolyline, sketchOps, sketchPaths, type ShapeSpec} from '../lib/rough';
import {Pencil} from './Pencil';
import {STROKE, THEME} from '../theme';

export type SketchShapeProps = {
  spec: ShapeSpec;
  /** frame (relative a la scene) ou le trace demarre */
  start: number;
  /** duree du trace en frames (0.8s a 1.5s recommande) */
  duration: number;
  seed?: number;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  roughOptions?: Options;
  /** affiche la main au crayon pendant le trace */
  pencil?: boolean;
  /** taille de la main au crayon */
  pencilScale?: number;
  dashed?: boolean;
};

const easeDraw = (t: number) => {
  // demarrage franc, legere deceleration : geste de la main
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(1 - t, 1.7);
};

export const SketchShape: React.FC<SketchShapeProps> = ({
  spec,
  start,
  duration,
  seed = 1,
  color = THEME.ink,
  strokeWidth = STROKE.normal,
  opacity = 1,
  roughOptions,
  pencil = false,
  pencilScale = 0.95,
  dashed = false,
}) => {
  const frame = useCurrentFrame();

  const {paths, lengths, total, sampled} = useMemo(() => {
    const sets = sketchOps(spec, seed, roughOptions);
    const p = sketchPaths(spec, seed, roughOptions);
    const ls = sets.map((s) => samplePolyline([s]).total || 1);
    return {
      paths: p,
      lengths: ls,
      total: ls.reduce((a, b) => a + b, 0),
      sampled: samplePolyline(sets),
    };
  }, [spec, seed, roughOptions]);

  const raw = duration <= 0 ? 1 : (frame - start) / duration;
  const progress = easeDraw(raw);

  if (progress <= 0) return null;

  const drawn = progress * total;
  let consumed = 0;

  // En pointilles, le dash sert au style : la revelation passe par un
  // volet qui s'ouvre de gauche a droite.
  const clipId = `wipe-${seed}`;
  const xs = sampled.pts.map((p) => p.x);
  const ys = sampled.pts.map((p) => p.y);
  const minX = Math.min(...xs) - 16;
  const maxX = Math.max(...xs) + 16;
  const minY = Math.min(...ys) - 30;
  const maxY = Math.max(...ys) + 30;

  return (
    <g opacity={opacity} clipPath={dashed ? `url(#${clipId})` : undefined}>
      {dashed ? (
        <defs>
          <clipPath id={clipId}>
            <rect x={minX} y={minY} width={(maxX - minX) * progress} height={maxY - minY} />
          </clipPath>
        </defs>
      ) : null}
      {paths.map((d, i) => {
        const len = lengths[i] ?? 1;
        const local = Math.max(0, Math.min(1, (drawn - consumed) / len));
        consumed += len;
        if (local <= 0) return null;
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={dashed ? '0.045 0.035' : '1 1'}
            strokeDashoffset={dashed ? 0 : 1 - local}
          />
        );
      })}
      {pencil && progress < 1 ? (
        (() => {
          const pt = pointAt(sampled, progress);
          return (
            <Pencil x={pt.x} y={pt.y} scale={pencilScale} strokeWidth={4 / pencilScale} />
          );
        })()
      ) : null}
    </g>
  );
};

/** Plusieurs formes tracees a la suite, avec un petit decalage entre chaque. */
export const SketchGroup: React.FC<{
  shapes: {spec: ShapeSpec; seed?: number; strokeWidth?: number; roughOptions?: Options}[];
  start: number;
  /** duree du trace de chaque forme */
  each: number;
  /** decalage entre deux formes */
  stagger?: number;
  color?: string;
  pencilOnLast?: boolean;
}> = ({shapes, start, each, stagger, color, pencilOnLast = false}) => {
  const step = stagger ?? each * 0.75;
  return (
    <>
      {shapes.map((s, i) => (
        <SketchShape
          key={i}
          spec={s.spec}
          seed={s.seed ?? 100 + i * 7}
          start={start + i * step}
          duration={each}
          color={color}
          strokeWidth={s.strokeWidth}
          roughOptions={s.roughOptions}
          pencil={pencilOnLast && i === shapes.length - 1}
        />
      ))}
    </>
  );
};
