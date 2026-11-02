import type { BoardAssets, BoardData, BoardElement } from "@/data/types";
import { Cutout } from "./elements/Cutout";
import { Doc } from "./elements/Doc";
import { Note } from "./elements/Note";
import { Photo } from "./elements/Photo";
import { Role } from "./elements/Role";
import { Schema } from "./elements/Schema";

export function ElementView({ el, color, assets, ui }: { el: BoardElement; color: string; assets: BoardAssets; ui: BoardData["ui"] }) {
  switch (el.type) {
    case "cutout":
      return <Cutout el={el} assets={assets} />;
    case "photo":
      return <Photo el={el} assets={assets} creditLabel={ui.photoCredit} />;
    case "role":
      return <Role el={el} color={color} />;
    case "doc":
      return <Doc el={el} />;
    case "mini-schema":
      return <Schema el={el} />;
    case "note":
      return <Note el={el} />;
  }
}
