import type { MetricElement } from "@/data/types";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function Metric({ el }: { el: MetricElement }) {
  const Trend = el.trend === "up" ? ArrowUpRight : el.trend === "down" ? ArrowDownRight : Minus;
  return (
    <div className="rounded-2xl bg-white shadow-card border border-[#E3E6EE] p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[52px] font-black leading-none tracking-tight text-navy" data-anchor="value">
          {el.value}
        </div>
        <span className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8ECFF] text-indigo">
          <Trend size={26} strokeWidth={2.5} />
        </span>
      </div>
      <div className="mt-3 text-[24px] font-bold leading-tight text-navy" data-anchor="label">
        {el.label}
      </div>
      {el.caption && (
        <div className="mt-2 text-[22px] leading-snug text-slate" data-anchor="caption">
          {el.caption}
        </div>
      )}
    </div>
  );
}
