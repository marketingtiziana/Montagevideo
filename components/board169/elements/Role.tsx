import type { RoleElement } from "@/data/board169-types";
import { Icon } from "../icons";

export function Role({ el, color }: { el: RoleElement; color: string }) {
  return (
    <div className="rounded-2xl border border-[#E3E6EE] bg-white px-5 py-3.5 shadow-card">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: color }}>
          <Icon name={el.icon} size={26} strokeWidth={2.2} />
        </span>
        <div className="text-[26px] font-black leading-tight text-navy">{el.name}</div>
      </div>
      <p className="mt-2 text-[20px] leading-snug text-navy/80">{el.line}</p>
    </div>
  );
}
