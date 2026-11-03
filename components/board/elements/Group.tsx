import type { GroupElement } from "@/data/types";
import { Users } from "lucide-react";

/** Faux groupe WhatsApp : avis contradictoires. */
export function Group({ el }: { el: GroupElement }) {
  return (
    <div className="ui overflow-hidden rounded-lg border border-[#e4e4e2] bg-white shadow-soft">
      <div className="flex items-center gap-2 bg-[#075e54] px-3 py-2 text-white">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <Users size={14} />
        </span>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[13px] font-semibold">{el.name}</div>
          <div className="truncate text-[11px] text-white/70">{el.members}</div>
        </div>
      </div>
      <div className="space-y-1.5 bg-[#ece5dd] px-2.5 py-3">
        {el.messages.map((m, i) => (
          <div key={i} className="flex justify-start">
            <div className="max-w-[88%] rounded-lg rounded-tl-sm bg-white px-2.5 py-1.5 text-[12.5px] leading-snug text-[#1d1d1f] shadow-sm">
              <div className="text-[11px] font-semibold" style={{ color: m.color }}>
                {m.from}
              </div>
              {m.text}
              <div className="mt-0.5 text-right text-[10px] text-[#8a8a8f]">{m.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
