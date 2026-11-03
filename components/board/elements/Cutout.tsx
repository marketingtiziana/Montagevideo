import Image from "next/image";
import type { BoardAssets, CutoutElement } from "@/data/types";

/** PNG détouré posé directement sur le papier, ombre douce. */
export function Cutout({ el, assets }: { el: CutoutElement; assets: BoardAssets }) {
  const png = assets.cutouts[el.id];
  const aspect = png ? png.width / png.height : el.aspect;
  if (png) {
    return (
      <div className="relative w-full" style={{ aspectRatio: `${aspect}`, filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.18))" }}>
        <Image src={`/board/cutouts/${el.id}.png`} alt={el.alt} fill sizes="400px" className="object-contain" />
      </div>
    );
  }
  return (
    <div className="flex w-full items-center justify-center rounded-lg border border-dashed border-[#c9c9c5] bg-[#e9e9e6] text-center text-[11px] text-[#8a8a8f]" style={{ aspectRatio: `${aspect}` }}>
      {el.alt}
    </div>
  );
}
