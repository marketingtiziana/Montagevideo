import Image from "next/image";
import type { BoardAssets, PhotoElement } from "@/data/types";
import { Icon } from "../icons";

export function Photo({ el, assets }: { el: PhotoElement; assets: BoardAssets }) {
  const credit = assets.raw[el.id];
  return (
    <figure className="overflow-hidden rounded-lg border border-[#e4e4e2] bg-white shadow-soft">
      <div className="relative w-full bg-[#e9e9e6]" style={{ aspectRatio: `${el.aspect}` }}>
        {credit ? (
          <Image src={`/board/raw/${el.id}.jpg`} alt={el.caption ?? el.id} fill sizes="400px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[#9a9a9f]">
            <Icon name="image" size={28} strokeWidth={1.5} />
            <span className="px-3 text-center text-[11px]">{el.caption ?? el.id}</span>
          </div>
        )}
      </div>
      {el.caption && credit && <figcaption className="px-2.5 py-1.5 text-[11px] text-[#6b6b70]">{el.caption}</figcaption>}
    </figure>
  );
}
