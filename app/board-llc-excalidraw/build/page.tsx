"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { board } from "@/data/excalidraw";
import type { SceneAssets } from "@/data/excalidraw-types";
import { buildSkeleton, curveArrows } from "@/lib/scene";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(async () => (await import("@excalidraw/excalidraw")).Excalidraw, { ssr: false });

/**
 * Page outil pour scripts/build-scene.ts : convertit le skeleton en éléments Excalidraw
 * dans un vrai navigateur, une fois la police Excalifont chargée (mesure du texte exacte),
 * et expose le résultat dans window.__scene.
 */
export default function BuildPage() {
  const [status, setStatus] = useState("…");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("@excalidraw/excalidraw");
      const assets = (await fetch("/board/assets.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : { images: {} }))) as SceneAssets;
      // Attend que l'instance cachée ait enregistré les polices, puis force leur chargement.
      const fonts = (document as Document & { fonts: FontFaceSet }).fonts;
      const faces = () => Array.from(fonts as unknown as Iterable<FontFace>).filter((f) => f.family.replace(/"/g, "") === "Excalifont");
      for (let i = 0; i < 100 && faces().length === 0; i++) await new Promise((res) => setTimeout(res, 100));
      if (faces().length === 0) throw new Error("police Excalifont non enregistrée");
      await Promise.all(faces().map((f) => f.load()));
      await fonts.ready;
      const skeleton = buildSkeleton(board, assets);
      type Converted = Parameters<typeof curveArrows>[0];
      const elements = curveArrows(mod.convertToExcalidrawElements(skeleton as never, { regenerateIds: false }) as unknown as Converted);
      if (cancelled) return;
      (window as unknown as { __scene: unknown }).__scene = { elements };
      setStatus(`${elements.length} éléments`);
    })().catch((err) => setStatus(`erreur : ${(err as Error).message}`));
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <>
      <pre data-build-status={status}>{status}</pre>
      {/* Instance cachée : déclenche le chargement des polices Excalidraw. */}
      <div style={{ position: "fixed", left: 0, top: 0, width: 600, height: 400, opacity: 0, pointerEvents: "none" }}>
        <Excalidraw initialData={{ elements: [{ type: "text", id: "probe", x: 0, y: 0, text: "probe", fontFamily: 5, fontSize: 20 } as never] }} />
      </div>
    </>
  );
}
