"use client";

import { useSearchParams } from "next/navigation";
import type { BoardAssets, BoardData } from "@/data/types";
import { Board } from "./Board";

export function BoardPage({ data, assets }: { data: BoardData; assets: BoardAssets }) {
  const params = useSearchParams();
  const sectionParam = Number(params.get("section"));
  const sectionOnly = Number.isInteger(sectionParam) && sectionParam > 0 ? sectionParam : undefined;
  return (
    <main className="min-h-screen bg-[#DDE2EC] py-10">
      <div className="mx-auto" style={{ width: 1080 }}>
        <Board data={data} assets={assets} sectionOnly={sectionOnly} />
      </div>
    </main>
  );
}
