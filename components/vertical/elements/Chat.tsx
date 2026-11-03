import type { ChatElement } from "@/data/vertical-types";
import { Check, CheckCheck, Phone, Video } from "lucide-react";

export function Chat({ el }: { el: ChatElement }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#E3E6EE] bg-white shadow-card">
      <div className="flex items-center gap-3 bg-[#0F1535] px-5 py-4 text-white">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#4F6BFF] text-[22px] font-black">
          {el.contact.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[22px] font-bold leading-tight">{el.contact}</div>
          <div className="text-[22px] leading-tight text-white/60">{el.status}</div>
        </div>
        <Video size={24} className="text-white/70" />
        <Phone size={22} className="text-white/70" />
      </div>
      <div className="space-y-3 bg-[#EEF2F8] px-4 py-5">
        {el.messages.map((m, i) => {
          const mine = m.from === "me";
          return (
            <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-[22px] leading-snug shadow-sm ${
                  mine ? "rounded-br-md bg-[#DCE6FF] text-navy" : "rounded-bl-md bg-white text-navy"
                }`}
                data-anchor={`msg-${i + 1}`}
              >
                {m.text}
                <span className="ml-3 inline-flex translate-y-[3px] items-center gap-1 whitespace-nowrap text-[20px] text-slate">
                  {m.time}
                  {mine ? <CheckCheck size={18} className="text-[#4F6BFF]" /> : <Check size={18} className="opacity-0" />}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
