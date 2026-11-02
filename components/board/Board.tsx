"use client";

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { BoardAssets, BoardData, Section } from "@/data/types";
import { computeGeometry, computeNoteArrows, type Geometry, type PathItem } from "@/lib/geometry";
import { layoutSection, type Placed } from "@/lib/layout";
import { DecorBack, DecorFront } from "./Decor";
import { ElementView } from "./ElementView";
import { SectionHeader } from "./SectionHeader";

function PlacedView({
  p,
  color,
  assets,
  ui,
  memeFile,
}: {
  p: Placed;
  color: string;
  assets: BoardAssets;
  ui: BoardData["ui"];
  memeFile: string | null;
}) {
  const left = p.side === "left";
  if (p.el.type === "meme" && !memeFile) {
    // Emplacement réservé : rien à afficher tant que public/board/memes est vide.
    return <div aria-hidden className={left ? "col-start-1" : "col-start-2"} />;
  }
  return (
    <div
      data-el={p.el.id}
      data-side={p.side}
      className={`relative ${left ? "col-start-1 justify-self-end" : "col-start-2 justify-self-start"}`}
      style={{
        width: p.width,
        marginTop: p.stagger,
        marginRight: left ? p.gap : undefined,
        marginLeft: left ? undefined : p.gap,
        transform: `rotate(${p.rotate}deg)`,
      }}
    >
      <ElementView el={p.el} color={color} assets={assets} ui={ui} memeFile={memeFile} />
    </div>
  );
}

function SectionView({
  section,
  assets,
  ui,
  memeFiles,
}: {
  section: Section;
  assets: BoardAssets;
  ui: BoardData["ui"];
  memeFiles: Record<string, string | null>;
}) {
  const rows = useMemo(() => layoutSection(section), [section]);
  const colorFor = (side: "left" | "right") =>
    section.columns ? (side === "left" ? section.columns.left.color : section.columns.right.color) : section.color;
  return (
    <section data-section={section.id} className="relative pb-16">
      <SectionHeader section={section} />
      {section.columns && (
        <div className="grid" style={{ gridTemplateColumns: "540px 540px" }}>
          <div className="col-start-1 justify-self-end mr-12 -rotate-1">
            <span
              className="inline-block rounded-full px-5 py-2 text-[26px] font-black text-white shadow-soft"
              style={{ background: section.columns.left.color }}
            >
              {section.columns.left.title}
            </span>
          </div>
          <div className="col-start-2 justify-self-start ml-12 mt-6 rotate-1">
            <span
              className="inline-block rounded-full px-5 py-2 text-[26px] font-black text-white shadow-soft"
              style={{ background: section.columns.right.color }}
            >
              {section.columns.right.title}
            </span>
          </div>
        </div>
      )}
      {rows.map((row) => (
        <div key={row.key} className="grid items-start" style={{ gridTemplateColumns: "540px 540px", marginTop: row.marginTop }}>
          {row.left && <PlacedView p={row.left} color={colorFor("left")} assets={assets} ui={ui} memeFile={memeFiles[row.left.el.id] ?? null} />}
          {row.right && <PlacedView p={row.right} color={colorFor("right")} assets={assets} ui={ui} memeFile={memeFiles[row.right.el.id] ?? null} />}
        </div>
      ))}
    </section>
  );
}

export interface BoardHandle {
  root: HTMLDivElement | null;
}

export const Board = forwardRef<BoardHandle, { data: BoardData; assets: BoardAssets; sectionOnly?: number }>(function Board(
  { data, assets, sectionOnly },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [geom, setGeom] = useState<Geometry | null>(null);
  const [noteArrows, setNoteArrows] = useState<PathItem[]>([]);
  useImperativeHandle(ref, () => ({ root: rootRef.current }), []);

  const sections = useMemo(
    () => (sectionOnly ? data.sections.filter((s) => s.number === sectionOnly) : data.sections),
    [data, sectionOnly],
  );

  // Les mèmes présents dans public/board/memes sont attribués dans l'ordre des éléments `meme`.
  const memeFiles = useMemo(() => {
    const map: Record<string, string | null> = {};
    let i = 0;
    data.sections.forEach((s) =>
      s.elements.forEach((el) => {
        if (el.type === "meme") {
          map[el.id] = assets.memes[i] ?? null;
          i += 1;
        }
      }),
    );
    return map;
  }, [data, assets]);

  useLayoutEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled || !rootRef.current) return;
      setGeom(computeGeometry(rootRef.current, sections));
    };
    const fonts = typeof document !== "undefined" && "fonts" in document ? document.fonts.ready : Promise.resolve();
    fonts.then(run, run);
    window.addEventListener("resize", run);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", run);
    };
  }, [sections]);

  useEffect(() => {
    if (!geom || !rootRef.current) return;
    setNoteArrows(computeNoteArrows(rootRef.current, geom.notes));
  }, [geom]);

  const last = sections[sections.length - 1];
  return (
    <div
      ref={rootRef}
      data-board
      data-board-ready={geom ? "true" : "false"}
      className="paper-grid relative overflow-hidden"
      style={{ width: 1080 }}
    >
      <DecorBack geom={geom} />
      <div className="relative z-10 pb-16 pt-14">
        {sections.map((s) => (
          <SectionView key={s.id} section={s} assets={assets} ui={data.ui} memeFiles={memeFiles} />
        ))}
        {last && last.number === data.sections.length && (
          <div className="relative mt-4 flex flex-col items-center gap-4">
            <div data-node="end" className="h-10 w-10" />
            <div className="text-[22px] font-bold uppercase tracking-[0.14em] text-slate">{data.ui.end}</div>
            <div className="text-[22px] font-semibold text-navy">{data.brand}</div>
          </div>
        )}
      </div>
      <DecorFront geom={geom} noteArrows={noteArrows} />
    </div>
  );
});
