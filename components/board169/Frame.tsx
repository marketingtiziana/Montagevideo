"use client";

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { BoardAssets, BoardData } from "@/data/board169-types";
import { computeLinks, FRAME_H, FRAME_W, type LinkGeometry } from "@/lib/links";
import { rngFor } from "@/lib/rng";
import { ElementView } from "./ElementView";

export interface FrameHandle {
  /** Le cadre 1920x1080 (cible des exports). */
  frame: HTMLDivElement | null;
  /** La scène plein écran (letterbox). */
  stage: HTMLDivElement | null;
}

/**
 * Cadre 1920x1080 mis à l'échelle pour remplir la fenêtre en gardant le 16:9.
 */
export const Frame = forwardRef<FrameHandle, { data: BoardData; assets: BoardAssets; onReady?: () => void }>(function Frame(
  { data, assets, onReady },
  ref,
) {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [links, setLinks] = useState<LinkGeometry | null>(null);
  useImperativeHandle(ref, () => ({ frame: frameRef.current, stage: stageRef.current }), []);

  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / FRAME_W, window.innerHeight / FRAME_H));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useLayoutEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled || !frameRef.current) return;
      const rr = frameRef.current.getBoundingClientRect();
      setLinks(computeLinks(frameRef.current, data, rr.width / FRAME_W || 1));
    };
    const fonts = typeof document !== "undefined" && "fonts" in document ? document.fonts.ready : Promise.resolve();
    fonts.then(run, run);
    return () => {
      cancelled = true;
    };
  }, [data, scale]);

  useEffect(() => {
    if (links) onReady?.();
  }, [links, onReady]);

  const placed = useMemo(
    () =>
      data.elements.map((el) => {
        const r = rngFor(`place/${el.id}`);
        return {
          el,
          x: el.x + Math.round(r.range(-10, 10)),
          y: el.y + Math.round(r.range(-10, 10)),
          rotate: el.rotate ?? Math.round(r.range(-3, 3) * 10) / 10,
          color: data.groups.find((g) => g.id === el.group)?.color ?? "#0F1535",
        };
      }),
    [data],
  );

  const c = data.center;
  return (
    <div ref={stageRef} className="fixed inset-0 overflow-hidden bg-navy print:static print:h-[1080px] print:w-[1920px] print:bg-paper" data-stage>
      <div
        ref={frameRef}
        data-frame
        data-frame-ready={links ? "true" : "false"}
        className="paper-grid absolute left-1/2 top-1/2 overflow-hidden print:!left-0 print:!top-0 print:!transform-none"
        style={{ width: FRAME_W, height: FRAME_H, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center" }}
      >
        {/* Liens roughjs, sous les éléments */}
        <svg width={FRAME_W} height={FRAME_H} viewBox={`0 0 ${FRAME_W} ${FRAME_H}`} className="pointer-events-none absolute left-0 top-0 z-0" aria-hidden>
          {links?.paths.map((p) => (
            <path key={p.key} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? "none"} strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </svg>

        {/* Intitulés de groupe */}
        {data.groups.map((g) =>
          g.labelAt ? (
            <div
              key={g.id}
              className="absolute z-10 text-[22px] font-extrabold uppercase tracking-[0.14em]"
              style={{ left: g.labelAt.x, top: g.labelAt.y, color: g.color, transform: `rotate(${g.labelAt.rotate ?? 0}deg)`, transformOrigin: "left center" }}
            >
              {g.title}
            </div>
          ) : null,
        )}

        {/* Nœud central */}
        <div
          data-center
          className="absolute z-10 flex flex-col items-center justify-center rounded-full bg-navy text-white shadow-card"
          style={{ left: c.x - c.size / 2, top: c.y - c.size / 2, width: c.size, height: c.size }}
        >
          <span className="text-[64px] font-black leading-none tracking-tight">{c.label}</span>
          <span className="mt-1 px-3 text-center text-[20px] font-semibold leading-tight text-white/75">{c.sub}</span>
        </div>

        {/* Éléments */}
        {placed.map((p) => (
          <div
            key={p.el.id}
            data-el={p.el.id}
            className="absolute z-10"
            style={{ left: p.x, top: p.y, width: p.el.w, transform: `rotate(${p.rotate}deg)` }}
          >
            <ElementView el={p.el} color={p.color} assets={assets} ui={data.ui} />
          </div>
        ))}

        {/* Étiquettes de lien, au-dessus des liens, sous les éléments */}
        {links?.labels.map((l) => (
          <span
            key={l.key}
            className="absolute z-[5] whitespace-nowrap rounded-full border bg-white px-2.5 py-0.5 text-[20px] font-bold leading-tight"
            style={{ left: l.x, top: l.y, transform: `translate(-50%, -50%) rotate(${l.rotate}deg)`, borderColor: l.color, color: l.color }}
          >
            {l.text}
          </span>
        ))}
      </div>
    </div>
  );
});
