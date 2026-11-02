import fs from "node:fs";
import path from "node:path";
import { Board } from "@/components/board/Board";
import { board } from "@/data/board";
import type { BoardAssets } from "@/data/types";

/** Ressources locales lues au build : aucun appel réseau au runtime. */
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
  let memes: string[] = [];
  try {
    memes = fs.readdirSync(path.join(pub, "memes")).filter((f) => /\.(gif|png|jpe?g|webp)$/i.test(f)).sort();
  } catch {
    memes = [];
  }
  return { raw, cutouts, memes };
}

export default function Page() {
  return <Board data={board} assets={loadAssets()} />;
}
