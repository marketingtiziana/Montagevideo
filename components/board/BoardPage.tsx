"use client";

import { useCallback, useRef, useState } from "react";
import type { BoardAssets, BoardData } from "@/data/types";
import { Frame, type FrameHandle } from "./Frame";

export function BoardPage({ data, assets }: { data: BoardData; assets: BoardAssets }) {
  const frameRef = useRef<FrameHandle>(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  return (
    <main data-ready={ready ? "true" : "false"}>
      <Frame ref={frameRef} data={data} assets={assets} onReady={onReady} />
    </main>
  );
}
