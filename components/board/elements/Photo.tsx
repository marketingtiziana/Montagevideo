import Image from "next/image";
import type { BoardAssets, PhotoElement } from "@/data/types";
import { Icon } from "../icons";

export function Photo({ el, assets, creditLabel }: { el: PhotoElement; assets: BoardAssets; creditLabel: string }) {
  const credit = assets.raw[el.id];
  const aspect = el.aspect ?? 1.5;
  return (
    <figure className="overflow-hidden rounded-2xl bg-white p-2.5 shadow-card">
      <div className="relative w-full overflow-hidden rounded-xl bg-[#DCE3F2]" style={{ aspectRatio: `${aspect}` }}>
        {credit ? (
          <Image src={`/board/raw/${el.id}.jpg`} alt={el.caption} fill sizes="400px" className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#DCE3F2] to-[#C5CFE6] text-[#4F6BFF]">
            <Icon name={el.icon ?? "image"} size={56} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <figcaption className="px-1 pb-0.5 pt-2 text-[20px] font-semibold leading-snug text-navy">
        {el.caption}
        {credit && <span className="ml-2 font-normal text-slate">{creditLabel} : {credit.photographer}</span>}
      </figcaption>
    </figure>
  );
}
