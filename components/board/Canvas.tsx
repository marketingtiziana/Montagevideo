"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { BoardData } from "@/data/types";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(async () => (await import("@excalidraw/excalidraw")).Excalidraw, { ssr: false });

type ExcalidrawAPI = import("@excalidraw/excalidraw/types").ExcalidrawImperativeAPI;
type Scene = { elements: unknown[]; files: Record<string, unknown>; appState?: Record<string, unknown> };

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

export function Canvas({ data }: { data: BoardData }) {
  const params = useSearchParams();
  const [scene, setScene] = useState<Scene | null>(null);
  const [api, setApi] = useState<ExcalidrawAPI | null>(null);
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(params.get("ui") === "0");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch("/board/scene.excalidraw")
      .then((r) => r.json())
      .then((s: Scene) => setScene(s))
      .catch(() => setScene({ elements: [], files: {} }));
  }, []);

  const recenter = useCallback(() => {
    api?.scrollToContent(undefined, { fitToContent: true, animate: true, duration: 400 });
  }, [api]);

  const zoomGroup = useCallback(
    (group: string) => {
      if (!api) return;
      // Les flèches vers le nœud central sont exclues : on cadre le contenu du groupe.
      const all = api.getSceneElements();
      const arrowIds = new Set(all.filter((el) => el.type === "arrow").map((el) => el.id));
      const els = all.filter(
        (el) =>
          (el.customData as { group?: string } | undefined)?.group === group &&
          el.type !== "arrow" &&
          !(el.type === "text" && el.containerId && arrowIds.has(el.containerId)),
      );
      if (els.length === 0) return;
      api.scrollToContent(els, { fitToViewport: true, viewportZoomFactor: 0.85, animate: true, duration: 500 });
    },
    [api],
  );

  const exportAs = useCallback(
    async (kind: "scene" | "png" | "svg") => {
      if (!api || busy) return;
      setBusy(kind);
      try {
        const mod = await import("@excalidraw/excalidraw");
        const elements = api.getSceneElements();
        const appState = api.getAppState();
        const files = api.getFiles();
        if (kind === "scene") {
          const json = mod.serializeAsJSON(elements, appState, files, "local");
          download(new Blob([json], { type: "application/json" }), "board-llc.excalidraw");
        } else if (kind === "png") {
          const blob = await mod.exportToBlob({
            elements,
            appState: { ...appState, exportBackground: true, viewBackgroundColor: "#F7F8FB" },
            files,
            mimeType: "image/png",
            exportPadding: 80,
            getDimensions: (w: number, h: number) => ({ width: w * 2, height: h * 2, scale: 2 }),
          });
          download(blob, "board-llc-2x.png");
        } else {
          const svg = await mod.exportToSvg({ elements, appState: { ...appState, exportBackground: true, viewBackgroundColor: "#F7F8FB" }, files, exportPadding: 80 });
          download(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" }), "board-llc.svg");
        }
      } finally {
        setBusy(null);
      }
    },
    [api, busy],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key.toLowerCase() === "h") setHidden((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!api || !scene) return;
    (window as unknown as { __boardZoom?: (g: string) => void }).__boardZoom = zoomGroup;
    const t = window.setTimeout(() => {
      api.scrollToContent(undefined, { fitToContent: true });
      setReady(true);
    }, 300);
    return () => window.clearTimeout(t);
  }, [api, scene, zoomGroup]);

  const btn = "rounded-xl px-2.5 py-1.5 text-[15px] font-bold leading-tight disabled:opacity-40";
  return (
    <div className="fixed inset-0" data-scene-ready={ready ? "true" : "false"}>
      {scene ? (
        <Excalidraw
          excalidrawAPI={setApi}
          langCode="fr-FR"
          initialData={{
            elements: scene.elements as never,
            files: scene.files as never,
            appState: {
              viewBackgroundColor: "#F7F8FB",
              currentItemFontFamily: 5,
              currentItemRoughness: 2,
              currentItemStrokeColor: "#0F1535",
              currentItemStrokeWidth: 2,
              ...(scene.appState ?? {}),
            } as never,
          }}
          UIOptions={{ canvasActions: { changeViewBackgroundColor: false, toggleTheme: false } }}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-[#F7F8FB] text-[20px] text-navy">{data.ui.loading}</div>
      )}
      {!hidden && (
        <div
          data-bar
          className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-32px)] -translate-x-1/2 flex-wrap items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl bg-navy/90 p-1.5 text-white shadow-card backdrop-blur"
        >
          <button type="button" onClick={recenter} disabled={!ready} className={`${btn} bg-indigo`}>
            {data.ui.recenter}
          </button>
          <span className="ml-1 text-[12px] uppercase tracking-wider text-white/60">{data.ui.zoomGroup}</span>
          {data.groups.map((g, i) => (
            <button key={g.id} type="button" onClick={() => zoomGroup(g.id)} disabled={!ready} title={g.title} className={`${btn} bg-white/10`} style={{ borderBottom: `3px solid ${g.color}` }}>
              {i + 1}
            </button>
          ))}
          <span className="ml-1 text-[12px] uppercase tracking-wider text-white/60">{data.ui.export}</span>
          <button type="button" onClick={() => exportAs("scene")} disabled={!ready || busy !== null} className={`${btn} bg-white/10`}>
            {data.ui.exportScene}
          </button>
          <button type="button" onClick={() => exportAs("png")} disabled={!ready || busy !== null} className={`${btn} bg-white/10`}>
            {data.ui.exportPng}
          </button>
          <button type="button" onClick={() => exportAs("svg")} disabled={!ready || busy !== null} className={`${btn} bg-white/10`}>
            {data.ui.exportSvg}
          </button>
          <span className="px-2 text-[13px] text-white/60">{data.ui.hint}</span>
        </div>
      )}
    </div>
  );
}
