import type { BoardAssets, BoardData, BoardElement } from "@/data/vertical-types";
import { Callout } from "./elements/Callout";
import { Chart } from "./elements/Chart";
import { Chat } from "./elements/Chat";
import { Meme } from "./elements/Meme";
import { Metric } from "./elements/Metric";
import { Photo } from "./elements/Photo";
import { RoleCard } from "./elements/RoleCard";
import { Screenshot } from "./elements/Screenshot";

export function ElementView({
  el,
  color,
  assets,
  ui,
  memeFile,
}: {
  el: BoardElement;
  color: string;
  assets: BoardAssets;
  ui: BoardData["ui"];
  memeFile: string | null;
}) {
  switch (el.type) {
    case "screenshot":
      return <Screenshot el={el} />;
    case "chat":
      return <Chat el={el} />;
    case "metric":
      return <Metric el={el} />;
    case "chart":
      return <Chart el={el} color={color} />;
    case "photo":
      return <Photo el={el} assets={assets} creditLabel={ui.photoCredit} />;
    case "meme":
      return <Meme el={el} file={memeFile} />;
    case "card":
      return <RoleCard el={el} color={color} labels={{ who: ui.cardWho, does: ui.cardDoes }} />;
    case "callout":
      return <Callout el={el} />;
  }
}
