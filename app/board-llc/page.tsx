import fs from "node:fs";
import path from "node:path";
import { Suspense } from "react";
import { BoardPage } from "@/components/board/BoardPage";
import { board } from "@/data/board";
import type { BoardAssets } from "@/data/types";

/** Lecture des ressources locales au build : aucun appel réseau au runtime. */
function loadAssets(): BoardAssets {
  const pub = path.join(process.cwd(), "public", "board");
  let memes: string[] = [];
  try {
    memes = fs
      .readdirSync(path.join(pub, "memes"))
      .filter((f) => /\.(gif|png|jpe?g|webp)$/i.test(f))
      .sort();
  } catch {
    memes = [];
  }
  let photos: BoardAssets["photos"] = {};
  try {
    const raw = fs.readFileSync(path.join(pub, "photos", "credits.json"), "utf8");
    const parsed = JSON.parse(raw) as BoardAssets["photos"];
    photos = Object.fromEntries(
      Object.entries(parsed).filter(([id]) => fs.existsSync(path.join(pub, "photos", `${id}.jpg`))),
    );
  } catch {
    photos = {};
  }
  return { memes, photos };
}

export default function Page() {
  const assets = loadAssets();
  return (
    <Suspense fallback={null}>
      <BoardPage data={board} assets={assets} />
    </Suspense>
  );
}
