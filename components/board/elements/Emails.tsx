import type { EmailsElement } from "@/data/types";
import { Mail, Send } from "lucide-react";

/** Faux fil d'emails envoyés, sans réponse. */
export function Emails({ el }: { el: EmailsElement }) {
  return (
    <div className="ui overflow-hidden rounded-lg border border-[#e4e4e2] bg-white shadow-soft">
      <div className="flex items-center gap-2 border-b border-[#e4e4e2] bg-[#fafafa] px-3 py-2 text-[12px] font-semibold text-[#1d1d1f]">
        <Send size={13} className="text-[#8a8a8f]" /> {el.folder}
      </div>
      {el.items.map((m, i) => (
        <div key={i} className="flex items-start gap-3 border-b border-[#efefed] px-3 py-2.5 last:border-b-0">
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f1f1ef] text-[#8a8a8f]">
            <Mail size={13} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[13px] font-semibold text-[#1d1d1f]">{m.subject}</span>
              <span className="shrink-0 text-[11px] text-[#8a8a8f]">{m.date}</span>
            </div>
            <div className="truncate text-[12px] text-[#6b6b70]">{m.preview}</div>
            <div className="mt-0.5 text-[11px] text-[#b4553f]">{m.status}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
