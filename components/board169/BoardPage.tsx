"use client";

import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { BoardAssets, BoardData } from "@/data/board169-types";
import { Frame, type FrameHandle } from "./Frame";
import { Hud } from "./Hud";

function Inner({ data, assets }: { data: BoardData; assets: BoardAssets }) {
  const params = useSearchParams();
  const initiallyHidden = params.get("ui") === "0";
  const handle = useRef<FrameHandle>(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const frameRef = useMemo(() => ({ get current() { return handle.current?.frame ?? null; } }), []);
  const stageRef = useMemo(() => ({ get current() { return handle.current?.stage ?? null; } }), []);
  return (
    <main data-ready={ready ? "true" : "false"}>
      <Frame ref={handle} data={data} assets={assets} onReady={onReady} />
      <Hud ui={data.ui} frameRef={frameRef} stageRef={stageRef} ready={ready} initiallyHidden={initiallyHidden} />
    </main>
  );
}

export function BoardPage(props: { data: BoardData; assets: BoardAssets }) {
  return (
    <Suspense fallback={null}>
      <Inner {...props} />
    </Suspense>
  );
}
