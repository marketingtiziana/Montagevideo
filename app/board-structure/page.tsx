import { Suspense } from "react";
import { Board } from "@/components/board/Board";
import { board } from "@/data/board-structure";

/** Board sans aucune image : rien à charger depuis public/board. */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Board data={board} assets={{ raw: {}, cutouts: {}, memes: [] }} />
    </Suspense>
  );
}
