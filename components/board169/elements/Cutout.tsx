import Image from "next/image";
import type { BoardAssets, CutoutElement } from "@/data/board169-types";
import { Icon } from "../icons";

/** Image détourée posée sur le papier, avec ombre portée douce. */
export function Cutout({ el, assets }: { el: CutoutElement; assets: BoardAssets }) {
  const png = assets.cutouts[el.id];
  const aspect = png ? png.width / png.height : (el.aspect ?? 1);
  if (png) {
    return (
      <div className="relative w-full" style={{ aspectRatio: `${aspect}`, filter: "drop-shadow(0 18px 22px rgba(15, 21, 53, 0.28))" }}>
        <Image src={`/board/cutouts/${el.id}.png`} alt={el.alt} fill sizes="400px" className="object-contain" priority />
      </div>
    );
  }
  return (
    <div
      className="flex w-full items-center justify-center rounded-3xl bg-gradient-to-br from-[#DCE3F2] to-[#C5CFE6] text-[#4F6BFF] shadow-card"
      style={{ aspectRatio: `${aspect}` }}
      aria-label={el.alt}
    >
      <Icon name={el.icon} size={64} strokeWidth={1.5} />
    </div>
  );
}
