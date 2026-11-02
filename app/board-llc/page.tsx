import fs from "node:fs";
import path from "node:path";
import { BoardPage } from "@/components/board/BoardPage";
import { board } from "@/data/board";
import type { BoardAssets } from "@/data/types";

/** Lecture des ressources locales au build : aucun appel réseau au runtime. */
function loadAssets(): BoardAssets {
  const pub = path.join(process.cwd(), "public", "board");
  const readJson = <T,>(file: string, fallback: T): T => {
    try {
      return JSON.parse(fs.readFileSync(file, "utf8")) as T;
    } catch {
      return fallback;
    }
  };
  const rawAll = readJson<BoardAssets["raw"]>(path.join(pub, "raw", "credits.json"), {});
  const raw = Object.fromEntries(Object.entries(rawAll).filter(([id]) => fs.existsSync(path.join(pub, "raw", `${id}.jpg`))));
  const cutAll = readJson<BoardAssets["cutouts"]>(path.join(pub, "cutouts", "manifest.json"), {});
  const cutouts = Object.fromEntries(Object.entries(cutAll).filter(([id]) => fs.existsSync(path.join(pub, "cutouts", `${id}.png`))));
  return { raw, cutouts };
}

export default function Page() {
  return <BoardPage data={board} assets={loadAssets()} />;
}
