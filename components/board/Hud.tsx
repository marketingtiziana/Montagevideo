"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { toPng } from "html-to-image";
import { Download, FileDown, Maximize2 } from "lucide-react";
import type { BoardData } from "@/data/types";

interface Props {
  ui: BoardData["ui"];
  frameRef: RefObject<HTMLElement>;
  stageRef: RefObject<HTMLElement>;
  ready: boolean;
  /** Interface masquée au chargement (?ui=0). */
  initiallyHidden: boolean;
}

/** Boutons d'export et raccourcis : F plein écran, H masque toute l'interface. */
export function Hud({ ui, frameRef, stageRef, ready, initiallyHidden }: Props) {
  const [hidden, setHidden] = useState(initiallyHidden);
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);

  const fullscreen = useCallback(() => {
    const el = stageRef.current ?? document.documentElement;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }, [stageRef]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "h") setHidden((v) => !v);
      if (k === "f") fullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const exportPng = useCallback(async () => {
    const node = frameRef.current;
    if (!node || busy) return;
    setBusy("png");
    try {
      const url = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#F7F8FB",
        width: node.offsetWidth,
        height: node.offsetHeight,
        style: { transform: "none", left: "0", top: "0" },
      });
      download(url, "board-llc-3840x2160.png");
    } finally {
      setBusy(null);
    }
  }, [frameRef, busy]);

  const exportPdf = useCallback(async () => {
    if (busy) return;
    setBusy("pdf");
    try {
      const res = await fetch("/api/export-pdf");
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      download(url, "board-llc-16x9.pdf");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      // Sans Playwright côté serveur (hébergement statique) : impression navigateur,
      // la feuille de style print cadre une page 16:9.
      window.print();
    } finally {
      setBusy(null);
    }
  }, [busy]);

  if (hidden) return null;

  return (
    <div data-hud className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl border border-white/10 bg-navy/90 p-2 text-white shadow-card backdrop-blur print:hidden">
      <button type="button" onClick={exportPng} disabled={!ready || busy !== null} className="inline-flex items-center gap-2 rounded-xl bg-indigo px-4 py-2 text-[18px] font-bold disabled:opacity-40">
        <Download size={18} /> {busy === "png" ? ui.exporting : ui.exportPng}
      </button>
      <button type="button" onClick={exportPdf} disabled={!ready || busy !== null} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-[18px] font-bold disabled:opacity-40">
        <FileDown size={18} /> {busy === "pdf" ? ui.exporting : ui.exportPdf}
      </button>
      <button type="button" onClick={fullscreen} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-[18px] font-bold">
        <Maximize2 size={18} /> {ui.fullscreen}
      </button>
      <span className="px-2 text-[16px] text-white/60">{ui.hint}</span>
    </div>
  );
}

function download(url: string, fileName: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
}
