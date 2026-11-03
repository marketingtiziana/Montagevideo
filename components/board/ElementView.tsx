import type { BoardAssets, BoardData, BoardElement } from "@/data/types";
import { Chart } from "./elements/Chart";
import { Chat } from "./elements/Chat";
import { Chip } from "./elements/Chip";
import { Cutout } from "./elements/Cutout";
import { Doc } from "./elements/Doc";
import { Flow } from "./elements/Flow";
import { Meme } from "./elements/Meme";
import { Metric } from "./elements/Metric";
import { Photo } from "./elements/Photo";
import { Scribble } from "./elements/Scribble";
import { Table } from "./elements/Table";
import { Postit } from "./elements/Postit";
import { Emails } from "./elements/Emails";
import { Group } from "./elements/Group";
import { Call } from "./elements/Call";
import { Calendar } from "./elements/Calendar";
import { Chart2 } from "./elements/Chart2";

export function ElementView({ el, assets, ui, memeFile }: { el: BoardElement; assets: BoardAssets; ui: BoardData["ui"]; memeFile: string | null }) {
  switch (el.type) {
    case "metric":
      return <Metric el={el} />;
    case "flow":
      return <Flow el={el} />;
    case "chat":
      return <Chat el={el} status={ui.chatStatus} />;
    case "chip":
      return <Chip el={el} />;
    case "chart":
      return <Chart el={el} />;
    case "doc":
      return <Doc el={el} />;
    case "photo":
      return <Photo el={el} assets={assets} />;
    case "cutout":
      return <Cutout el={el} assets={assets} />;
    case "meme":
      return <Meme el={el} file={memeFile} placeholder={ui.memePlaceholder} />;
    case "scribble":
      return <Scribble el={el} />;
    case "table":
      return <Table el={el} />;
    case "postit":
      return <Postit el={el} />;
    case "emails":
      return <Emails el={el} />;
    case "group":
      return <Group el={el} />;
    case "call":
      return <Call el={el} />;
    case "calendar":
      return <Calendar el={el} />;
    case "chart2":
      return <Chart2 el={el} />;
  }
}
