import type { ChatElement } from "@/data/types";
import { CheckCheck, Phone, Video } from "lucide-react";

/** Conversation type WhatsApp : bulles vertes à droite, grises à gauche. */
export function Chat({ el, status }: { el: ChatElement; status: string }) {
  return (
    <div className="ui overflow-hidden rounded-lg border border-[#e4e4e2] bg-white shadow-soft">
      <div className="flex items-center gap-2 bg-[#075e54] px-3 py-2 text-white">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[12px] font-bold">{el.contact.slice(0, 1)}</span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[13px] font-semibold">{el.contact}</div>
          <div className="text-[11px] text-white/70">{status}</div>
        </div>
        <Video size={15} className="text-white/80" />
        <Phone size={13} className="text-white/80" />
      </div>
      <div className="space-y-1.5 bg-[#ece5dd] px-2.5 py-3">
        {el.messages.map((m, i) => {
          const mine = m.from === "me";
          return (
            <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-[12.5px] leading-snug text-[#1d1d1f] shadow-sm ${mine ? "rounded-tr-sm bg-[#dcf8c6]" : "rounded-tl-sm bg-white"}`}>
                {m.text}
                <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-[#8a8a8f]">
                  {m.time}
                  {mine && <CheckCheck size={12} className="text-[#34b7f1]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
