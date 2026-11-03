import type { FlowElement } from "@/data/types";
import { Zap } from "lucide-react";

/** Faux écran d'automatisation : nœuds blancs reliés par des traits fins. */
export function Flow({ el }: { el: FlowElement }) {
  return (
    <div className="ui rounded-lg border border-[#e4e4e2] bg-[#fafafa] p-3 shadow-soft">
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="text-[13px] font-semibold text-[#1d1d1f]">{el.title}</span>
        <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] text-[#8a8a8f] ring-1 ring-[#e4e4e2]">
          <Zap size={11} /> {el.tag}
        </span>
      </div>
      <div className="relative ml-3">
        <div className="absolute bottom-5 left-[14px] top-5 w-px bg-[#d6d6d3]" />
        <div className="space-y-2">
          {el.nodes.map((n, i) => (
            <div key={i} className="relative flex items-center gap-3">
              <span className="relative z-10 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ring-4 ring-[#fafafa]" style={{ background: n.color }}>
                <span className="h-2 w-2 rounded-full bg-white/90" />
              </span>
              <div className="flex-1 rounded-md border border-[#e4e4e2] bg-white px-3 py-2">
                <div className="text-[13px] font-medium leading-tight text-[#1d1d1f]">{n.label}</div>
                {n.sub && <div className="text-[11px] leading-tight text-[#8a8a8f]">{n.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
