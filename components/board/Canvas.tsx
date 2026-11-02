"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type { BoardData } from "@/data/types";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(async () => (await import("@excalidraw/excalidraw")).Excalidraw, { ssr: false });

type ExcalidrawAPI = import("@excalidraw/excalidraw/types").ExcalidrawImperativeAPI;
type Scene = { elements: unknown[]; files: Record<string, unknown>; appState?: Record<string, unknown> };

export function Canvas({ data }: { data: BoardData }) {
  const [scene, setScene] = useState<Scene | null>(null);
  const [api, setApi] = useState<ExcalidrawAPI | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/board/scene.excalidraw")
      .then((r) => r.json())
      .then((s: Scene) => setScene(s))
      .catch(() => setScene({ elements: [], files: {} }));
  }, []);

  const recenter = useCallback(() => {
    if (!api) return;
    api.scrollToContent(undefined, { fitToContent: true, animate: true, duration: 400 });
  }, [api]);

  useEffect(() => {
    if (!api || !scene) return;
    const t = window.setTimeout(() => {
      api.scrollToContent(undefined, { fitToContent: true });
      setReady(true);
    }, 300);
    return () => window.clearTimeout(t);
  }, [api, scene]);

  return (
    <div className="fixed inset-0" data-scene-ready={ready ? "true" : "false"}>
      {scene ? (
        <Excalidraw
          excalidrawAPI={setApi}
          langCode="fr-FR"
          initialData={{
            elements: scene.elements as never,
            files: scene.files as never,
            appState: { viewBackgroundColor: "#F7F8FB", currentItemFontFamily: 5, currentItemRoughness: 2, currentItemStrokeColor: "#0F1535", ...(scene.appState ?? {}) } as never,
          }}
          UIOptions={{ canvasActions: { changeViewBackgroundColor: false, toggleTheme: false } }}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-[#F7F8FB] text-[20px] text-navy">{data.ui.loading}</div>
      )}
      <div data-bar className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-navy/90 p-2 text-white shadow-card backdrop-blur">
        <button type="button" onClick={recenter} className="rounded-xl bg-indigo px-3 py-1.5 text-[16px] font-bold">
          {data.ui.recenter}
        </button>
      </div>
    </div>
  );
}
