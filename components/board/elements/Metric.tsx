import type { MetricElement } from "@/data/types";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

/** Carte métrique style ads manager. Contour vert (bonne) ou rouge (mauvaise). */
export function Metric({ el }: { el: MetricElement }) {
  const color = el.tone === "good" ? "#3CA55C" : "#D94A3D";
  const Trend = el.trend === "up" ? ArrowUpRight : el.trend === "down" ? ArrowDownRight : Minus;
  return (
    <div className="ui rounded-lg bg-white px-4 pb-3 pt-3 shadow-soft" style={{ border: `2px solid ${color}` }}>
      <div className="flex items-start justify-between gap-3">
        <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full" style={{ background: `${color}1a`, color }}>
          <Trend size={16} strokeWidth={2.5} />
        </span>
        <div className="text-right text-[34px] font-bold leading-none tracking-tight text-[#1d1d1f]">{el.value}</div>
      </div>
      <div className="mt-2 text-[13px] leading-snug text-[#6b6b70]">{el.label}</div>
    </div>
  );
}
