import Image from "next/image";
import type { BoardAssets, PhotoElement } from "@/data/vertical-types";
import { Icon } from "../icons";

export function Photo({ el, assets, creditLabel }: { el: PhotoElement; assets: BoardAssets; creditLabel: string }) {
  const credit = assets.photos[el.id];
  const aspect = el.aspect ?? 1.5;
  return (
    <figure className="overflow-hidden rounded-3xl bg-white p-3 shadow-card">
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#DCE3F2]" style={{ aspectRatio: `${aspect}` }}>
        {credit ? (
          <Image src={`/board/photos/${el.id}.jpg`} alt={el.caption} fill sizes="480px" className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#DCE3F2] to-[#C5CFE6] text-[#4F6BFF]">
            <Icon name={el.icon ?? "image"} size={72} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <figcaption className="px-2 pb-1 pt-3 text-[22px] font-semibold leading-snug text-navy" data-anchor="caption">
        {el.caption}
        {credit && (
          <span className="mt-1 block text-[22px] font-normal text-slate">
            {creditLabel} : {credit.photographer}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
