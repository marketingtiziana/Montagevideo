import type { BankElement } from "@/data/types";
import { ArrowDownLeft, Bell, Search, ShieldAlert } from "lucide-react";

/** Faux écran bancaire : virement entrant, statut, bannière, sans montant. */
export function Bank({ el }: { el: BankElement }) {
  const good = el.tone === "good";
  const color = good ? "#3CA55C" : "#D94A3D";
  return (
    <div className="ui overflow-hidden rounded-lg border border-[#e4e4e2] bg-white shadow-soft">
      <div className="flex items-center gap-2 border-b border-[#e4e4e2] px-3 py-2">
        <span className="h-6 w-6 rounded-md bg-[#1d1d1f]" />
        <span className="flex-1 text-[13px] font-semibold text-[#1d1d1f]">{el.app}</span>
        <Search size={14} className="text-[#8a8a8f]" />
        <Bell size={14} className="text-[#8a8a8f]" />
      </div>
      {el.banner && (
        <div className="flex items-center gap-2 bg-[#fdecea] px-3 py-1.5 text-[11.5px] font-semibold text-[#b4553f]">
          <ShieldAlert size={13} /> {el.banner}
        </div>
      )}
      <div className="flex items-center gap-3 px-3 py-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: `${color}1a`, color }}>
          <ArrowDownLeft size={16} />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[13px] font-semibold text-[#1d1d1f]">{el.title}</div>
          {el.label && <div className="text-[11px] text-[#8a8a8f]">{el.label}</div>}
        </div>
        <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: `${color}1a`, color }}>
          {el.status}
        </span>
      </div>
      {el.note && <div className="px-3 pb-2 text-[11.5px] text-[#6b6b70]">{el.note}</div>}
      {el.button && (
        <div className="px-3 pb-3">
          <button type="button" disabled={el.button.disabled} className={`w-full rounded-md py-1.5 text-[12.5px] font-semibold ${el.button.disabled ? "cursor-not-allowed bg-[#e9e9e6] text-[#a0a0a5]" : "bg-[#1d1d1f] text-white"}`}>
            {el.button.text}
          </button>
        </div>
      )}
    </div>
  );
}
