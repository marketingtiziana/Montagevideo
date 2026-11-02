import Image from "next/image";
import type { MemeElement } from "@/data/types";

/** Mème fourni dans public/board/memes. Dossier vide : emplacement laissé vide. */
export function Meme({ el, file }: { el: MemeElement; file: string | null }) {
  if (!file) return null;
  return (
    <figure className="overflow-hidden rounded-lg border border-[#e4e4e2] bg-white shadow-soft">
      <div className="relative w-full bg-[#e9e9e6]" style={{ aspectRatio: "1" }}>
        <Image src={`/board/memes/${file}`} alt={el.caption ?? ""} fill sizes="400px" className="object-cover" unoptimized />
      </div>
      {el.caption && <figcaption className="px-2.5 py-1.5 text-[11px] text-[#6b6b70]">{el.caption}</figcaption>}
    </figure>
  );
}
