import type { ChipElement } from "@/data/types";
import { Info } from "lucide-react";
import { Icon } from "../icons";

/** Petite étiquette blanche : stat, ⓘ, pastilles d'icônes. */
export function Chip({ el }: { el: ChipElement }) {
  return (
    <div className="ui inline-flex items-center gap-2 rounded-lg border border-[#e4e4e2] bg-white py-1.5 pl-3 pr-2 shadow-soft">
      {el.stat && <span className="text-[14px] font-bold text-[#1d1d1f]">{el.stat}</span>}
      <span className="text-[12px] text-[#4b4b50]">{el.text}</span>
      <Info size={13} className="shrink-0 text-[#a0a0a5]" />
      <span className="flex -space-x-1.5">
        {el.icons.map((ic, i) => (
          <span key={i} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f1f1ef] text-[#4b4b50] ring-2 ring-white">
            <Icon name={ic} size={12} />
          </span>
        ))}
      </span>
    </div>
  );
}
