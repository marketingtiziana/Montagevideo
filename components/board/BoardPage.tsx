"use client";

import { useCallback, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { BoardAssets, BoardData } from "@/data/types";
import { Board } from "./Board";
import { Toolbar } from "./Toolbar";

const FRAME_W = 1080;
const FRAME_H = 1350;

export function BoardPage({ data, assets }: { data: BoardData; assets: BoardAssets }) {
  const params = useSearchParams();
  const sectionParam = Number(params.get("section"));
  const sectionOnly =
    Number.isInteger(sectionParam) && sectionParam > 0 && sectionParam <= data.sections.length ? sectionParam : undefined;
  const hideUi = params.get("ui") === "0";
  const autoParam = Number(params.get("autoscroll"));
  const fit = params.get("fit") !== "0";
  const autoStart = Number.isFinite(autoParam) && autoParam > 0 ? autoParam : undefined;

  const frameRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const onReady = useCallback((h: number) => setHeight(h), []);
  const ready = height !== null;

  if (sectionOnly) {
    // Mode carrousel : la section est cadrée en 1080x1350, réduite si elle dépasse.
    // Avec ?fit=0, le cadre garde la largeur 1080 et prend la hauteur de la section.
    const scale = height && fit ? Math.min(1, FRAME_H / height) : 1;
    const frameH = fit ? FRAME_H : Math.max(FRAME_H, height ?? FRAME_H);
    const offsetY = height ? Math.max(0, (frameH - height * scale) / 2) : 0;
    const offsetX = (FRAME_W - FRAME_W * scale) / 2;
    return (
      <main className="min-h-screen bg-[#DDE2EC]">
        <div
          ref={frameRef}
          data-frame
          data-frame-ready={ready ? "true" : "false"}
          className="paper-grid relative overflow-hidden"
          style={{ width: FRAME_W, height: frameH }}
        >
          <div style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`, transformOrigin: "top left", width: FRAME_W }}>
            <Board data={data} assets={assets} sectionOnly={sectionOnly} onReady={onReady} />
          </div>
        </div>
        <Toolbar ui={data.ui} targetRef={frameRef} fileName={`board-llc-section-${sectionOnly}.png`} ready={ready} hidden={hideUi} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#DDE2EC]">
      <div ref={frameRef} className="mx-auto" style={{ width: FRAME_W }}>
        <Board data={data} assets={assets} onReady={onReady} />
      </div>
      <Toolbar ui={data.ui} targetRef={frameRef} fileName="board-llc.png" autoStart={autoStart} ready={ready} hidden={hideUi} />
    </main>
  );
}
