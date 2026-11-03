"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { TransformComponent, TransformWrapper, type ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import rough from "roughjs/bin/rough";
import type { Arrow, BoardAssets, BoardData, BoardElement } from "@/data/types";
import { rngFor } from "@/lib/rng";
import { ElementView } from "./ElementView";

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const gen = rough.generator();

/** Point du bord d'une boîte en direction d'un point, avec marge. */
function edgeTowards(b: Box, to: { x: number; y: number }, margin: number) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const dx = to.x - cx;
  const dy = to.y - cy;
  const t = Math.min((b.w / 2 + margin) / Math.abs(dx || 1e-6), (b.h / 2 + margin) / Math.abs(dy || 1e-6));
  return { x: cx + dx * t, y: cy + dy * t };
}

function ArrowsLayer({ arrows, boxes, color, size }: { arrows: Arrow[]; boxes: Record<string, Box>; color: string; size: { w: number; h: number } }) {
  const paths = useMemo(() => {
    const out: { key: string; d: string; fill?: string; label?: { x: number; y: number; text: string } }[] = [];
    arrows.forEach((a, i) => {
      const from = boxes[a.from];
      const to = boxes[a.to];
      if (!from || !to) return;
      const toC = { x: to.x + to.w / 2, y: to.y + to.h / 2 };
      const fromC = { x: from.x + from.w / 2, y: from.y + from.h / 2 };
      const p0 = edgeTowards(from, toC, 10);
      const p1 = edgeTowards(to, fromC, 14);
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const len = Math.hypot(dx, dy) || 1;
      const r = rngFor(`arrow/${a.from}-${a.to}`);
      const k = r.range(0.12, 0.2) * len * (r.next() < 0.5 ? -1 : 1);
      const mid: [number, number] = [p0.x + dx / 2 - (dy / len) * k, p0.y + dy / 2 + (dx / len) * k];
      const seed = (r.seed % 2147483646) + 1;
      const curve = gen.curve([[p0.x, p0.y], mid, [p1.x, p1.y]], { stroke: color, strokeWidth: 2.2, roughness: 1.2, bowing: 1, disableMultiStroke: true, seed });
      gen.toPaths(curve).forEach((p, j) => out.push({ key: `${i}-${j}`, d: p.d }));
      // Pointe : direction tangente à l'arrivée.
      const tx = p1.x - mid[0];
      const ty = p1.y - mid[1];
      const ang = Math.atan2(ty, tx);
      const hl = 14;
      const h1 = [p1.x + Math.cos(ang + Math.PI * 0.8) * hl, p1.y + Math.sin(ang + Math.PI * 0.8) * hl];
      const h2 = [p1.x + Math.cos(ang - Math.PI * 0.8) * hl, p1.y + Math.sin(ang - Math.PI * 0.8) * hl];
      out.push({ key: `${i}-head`, d: `M ${h1[0]} ${h1[1]} L ${p1.x} ${p1.y} L ${h2[0]} ${h2[1]} Z`, fill: color });
      if (a.label) out.push({ key: `${i}-label`, d: "", label: { x: mid[0], y: mid[1] - 10, text: a.label } });
    });
    return out;
  }, [arrows, boxes, color]);
  return (
    <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} className="pointer-events-none absolute left-0 top-0 z-20" aria-hidden>
      {paths.map((p) =>
        p.label ? (
          <text key={p.key} x={p.label.x} y={p.label.y} fontSize={13} fontWeight={700} fill={color} textAnchor="middle" fontFamily="var(--font-inter), Inter, system-ui, sans-serif">
            {p.label.text}
          </text>
        ) : (
          <path key={p.key} d={p.d} stroke={color} strokeWidth={2.2} fill={p.fill ?? "none"} strokeLinecap="round" strokeLinejoin="round" />
        ),
      )}
    </svg>
  );
}

type Offset = { dx: number; dy: number };
const STORAGE_KEY = "board-llc-positions-v1";

/**
 * Élément déplaçable : motion values framer-motion pilotées par les pointer events,
 * deltas divisés par l'échelle du canvas pour suivre exactement le curseur à tout zoom.
 */
function DraggableItem({
  el,
  offset,
  getScale,
  onMove,
  onEnd,
  children,
}: {
  el: BoardElement;
  offset: Offset;
  getScale: () => number;
  onMove: (id: string, o: Offset) => void;
  onEnd: (id: string, o: Offset) => void;
  children: React.ReactNode;
}) {
  const x = useMotionValue(offset.dx);
  const y = useMotionValue(offset.dy);
  const drag = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null);
  useEffect(() => {
    if (!drag.current) {
      x.set(offset.dx);
      y.set(offset.dy);
    }
  }, [offset.dx, offset.dy, x, y]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, originX: x.get(), originY: y.get(), moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const s = getScale();
    d.moved = true;
    x.set(d.originX + (e.clientX - d.startX) / s);
    y.set(d.originY + (e.clientY - d.startY) / s);
    onMove(el.id, { dx: x.get(), dy: y.get() });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    if (d.moved) onEnd(el.id, { dx: x.get(), dy: y.get() });
  };
  return (
    <motion.div
      data-el={el.id}
      className="draggable absolute cursor-grab touch-none active:cursor-grabbing"
      style={{ left: el.x, top: el.y, width: el.w, zIndex: 10 + (el.z ?? 0), x, y }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {children}
    </motion.div>
  );
}

export function Board({ data, assets }: { data: BoardData; assets: BoardAssets }) {
  const [offsets, setOffsets] = useState<Record<string, Offset>>({});
  const wrapperRef = useRef<ReactZoomPanPinchRef>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [ready, setReady] = useState(false);

  const elements = useMemo(() => data.elements.filter((el) => el.type !== "scribble" || data.showAnnotations), [data]);

  // Mèmes de public/board/memes, attribués dans l'ordre aux éléments `meme`.
  const memeFiles = useMemo(() => {
    const map: Record<string, string | null> = {};
    let i = 0;
    data.elements.forEach((el) => {
      if (el.type === "meme") {
        map[el.id] = assets.memes[i] ?? null;
        i += 1;
      }
    });
    return map;
  }, [data, assets]);

  // Mesure des boîtes (hauteurs réelles) pour les traits et les flèches.
  const measure = useCallback(() => {
    const root = contentRef.current;
    if (!root) return;
    const next: Record<string, Box> = {};
    root.querySelectorAll<HTMLElement>("[data-el]").forEach((node) => {
      const id = node.dataset.el as string;
      const o = offsets[id] ?? { dx: 0, dy: 0 };
      next[id] = { x: node.offsetLeft + o.dx, y: node.offsetTop + o.dy, w: node.offsetWidth, h: node.offsetHeight };
    });
    setBoxes(next);
    setReady(true);
  }, [offsets]);

  // Positions déplacées, mémorisées dans le navigateur.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOffsets(JSON.parse(raw) as Record<string, Offset>);
    } catch {
      /* stockage indisponible : positions par défaut */
    }
  }, []);
  const persist = useCallback((next: Record<string, Offset>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignoré */
    }
  }, []);
  const onMove = useCallback((id: string, o: Offset) => setOffsets((prev) => ({ ...prev, [id]: o })), []);
  const onEnd = useCallback(
    (id: string, o: Offset) =>
      setOffsets((prev) => {
        const next = { ...prev, [id]: o };
        persist(next);
        return next;
      }),
    [persist],
  );
  const getScale = useCallback(() => wrapperRef.current?.instance.transformState.scale ?? 1, []);

  useLayoutEffect(() => {
    const fonts = typeof document !== "undefined" && "fonts" in document ? document.fonts.ready : Promise.resolve();
    fonts.then(measure, measure);
  }, [measure, elements, offsets]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    root.querySelectorAll<HTMLElement>("[data-el]").forEach((n) => ro.observe(n));
    return () => ro.disconnect();
  }, [measure, elements]);

  const columnOf = (c: BoardElement["column"]) => data.columns.find((x) => x.id === c)!;

  // Outil de capture : positionne la vue (x, y, échelle).
  useEffect(() => {
    const w = window as unknown as { __boardView?: (x: number, y: number, s: number) => void; __boardScale?: () => unknown };
    w.__boardView = (x, y, s) => wrapperRef.current?.setTransform(x, y, s, 0);
    w.__boardScale = () => ({ state: wrapperRef.current?.state?.scale, instance: wrapperRef.current?.instance?.transformState?.scale });
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#F3F3F1]" data-board-ready={ready ? "true" : "false"}>
      <TransformWrapper
        ref={wrapperRef}
        minScale={0.08}
        maxScale={3}
        initialScale={1}
        initialPositionX={210}
        initialPositionY={0}
        limitToBounds={false}
        centerOnInit={false}
        wheel={{ step: 0.08 }}
        panning={{ velocityDisabled: true, excluded: ["draggable"] }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: data.size.w, height: data.size.h }}>
          <div ref={contentRef} data-board className="paper relative" style={{ width: data.size.w, height: data.size.h }}>
            {/* Lignes verticales et titres de colonne */}
            {data.columns.map((c) => (
              <div key={c.id}>
                <div className="absolute top-0 z-0" style={{ left: c.x - 1, width: 2, height: data.size.h, background: c.color }} />
                <div
                  className="absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-md px-3 py-1 text-[14px] font-bold text-white shadow-soft"
                  style={{ left: c.x, top: 18, background: c.color }}
                >
                  {c.title}
                </div>
              </div>
            ))}
            {/* Intitulés de section, au milieu */}
            {data.sections.map((s) => (
              <div key={s.id} className="absolute z-10 rounded-md bg-white/80 px-2.5 py-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6b6b70] ring-1 ring-[#e4e4e2]" style={{ left: s.x, top: s.y }}>
                {s.text}
              </div>
            ))}
            {/* Petits traits entre la ligne et l'élément */}
            <svg width={data.size.w} height={data.size.h} className="pointer-events-none absolute left-0 top-0 z-0" aria-hidden>
              {elements
                .filter((el) => el.tick)
                .map((el) => {
                  const b = boxes[el.id];
                  if (!b) return null;
                  const c = columnOf(el.column);
                  const y = b.y + Math.min(40, b.h / 2);
                  const x1 = c.x;
                  const x2 = b.x + b.w / 2 > c.x ? b.x : b.x + b.w;
                  return <line key={el.id} x1={x1} x2={x2} y1={y} y2={y} stroke={c.color} strokeWidth={2} />;
                })}
            </svg>
            {/* Éléments */}
            {elements.map((el) => (
              <DraggableItem key={el.id} el={el} offset={offsets[el.id] ?? { dx: 0, dy: 0 }} getScale={getScale} onMove={onMove} onEnd={onEnd}>
                <ElementView el={el} assets={assets} ui={data.ui} memeFile={memeFiles[el.id] ?? null} />
              </DraggableItem>
            ))}
            <ArrowsLayer arrows={data.arrows} boxes={boxes} color="#2F6FE4" size={data.size} />
          </div>
        </TransformComponent>
      </TransformWrapper>
      {/* Vignettage très léger sur les bords de l'écran */}
      <div className="pointer-events-none fixed inset-0 z-30" style={{ boxShadow: "inset 0 0 120px rgba(0,0,0,0.06)" }} />
    </div>
  );
}
