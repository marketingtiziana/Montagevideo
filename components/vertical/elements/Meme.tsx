import Image from "next/image";
import type { MemeElement } from "@/data/vertical-types";

export function Meme({ el, file }: { el: MemeElement; file: string | null }) {
  if (!file) return null;
  return (
    <figure className="overflow-hidden rounded-3xl bg-white p-3 shadow-card">
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#DCE3F2]" style={{ aspectRatio: "1" }}>
        <Image src={`/board/memes/${file}`} alt={el.caption ?? ""} fill sizes="400px" className="object-cover" unoptimized />
      </div>
      {el.caption && (
        <figcaption className="px-2 pb-1 pt-3 text-[22px] font-semibold leading-snug text-navy">{el.caption}</figcaption>
      )}
    </figure>
  );
}
