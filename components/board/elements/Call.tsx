import type { CallElement } from "@/data/types";
import { PhoneMissed, PhoneOutgoing } from "lucide-react";

/** Faux écran d'appel manqué, bouton rappeler grisé. */
export function Call({ el }: { el: CallElement }) {
  return (
    <div className="ui rounded-lg border border-[#e4e4e2] bg-white px-4 py-4 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fdecea] text-[#D94A3D]">
          <PhoneMissed size={18} />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[14px] font-semibold text-[#1d1d1f]">{el.title}</div>
          <div className="text-[12px] text-[#6b6b70]">{el.subtitle}</div>
        </div>
        <span className="text-[11px] text-[#8a8a8f]">{el.time}</span>
      </div>
      <button type="button" disabled className="mt-3 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-[#e9e9e6] py-2 text-[13px] font-semibold text-[#a0a0a5]">
        <PhoneOutgoing size={14} /> {el.button}
      </button>
    </div>
  );
}
