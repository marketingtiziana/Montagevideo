import Image from "next/image";
import type { MemeElement } from "@/data/types";

/** Mème fourni dans public/board/memes. Dossier vide : emplacement réservé, discret. */
export function Meme({ el, file, placeholder }: { el: MemeElement; file: string | null; placeholder: string }) {
  if (!file) {
    return (
      <div className="flex w-full items-center justify-center rounded-lg border border-dashed border-[#c9c9c5] text-[11px] text-[#a0a0a5]" style={{ aspectRatio: "1.2" }}>
        {placeholder}
      </div>
    );
  }
  return (
    <figure className="overflow-hidden rounded-lg border border-[#e4e4e2] bg-white shadow-soft">
      <div className="relative w-full bg-[#e9e9e6]" style={{ aspectRatio: "1" }}>
        <Image src={`/board/memes/${file}`} alt={el.caption ?? ""} fill sizes="400px" className="object-cover" unoptimized />
      </div>
      {el.caption && <figcaption className="px-2.5 py-1.5 text-[11px] text-[#6b6b70]">{el.caption}</figcaption>}
    </figure>
  );
}
