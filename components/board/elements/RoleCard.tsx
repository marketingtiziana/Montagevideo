import type { CardElement } from "@/data/types";
import { Icon } from "../icons";

export function RoleCard({ el, color, labels }: { el: CardElement; color: string; labels: { who: string; does: string } }) {
  const optional = el.requiredTone === "optional";
  return (
    <div className="rounded-2xl border border-[#E3E6EE] bg-white p-6 shadow-card">
      <div className="flex items-center gap-4">
        <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: color }}>
          <Icon name={el.icon} size={34} strokeWidth={2.2} />
        </span>
        <div className="text-[30px] font-black leading-tight text-navy" data-anchor="name">
          {el.name}
        </div>
      </div>
      <div className="mt-4 text-[22px] leading-snug text-navy/85" data-anchor="who">
        <span className="font-extrabold text-navy">{labels.who}</span> {el.who}
      </div>
      <div className="mt-2 text-[22px] leading-snug text-navy/85" data-anchor="does">
        <span className="font-extrabold text-navy">{labels.does}</span> {el.does}
      </div>
      <div className="mt-4">
        <span
          className="inline-block rounded-full px-4 py-1.5 text-[22px] font-bold"
          style={{ background: optional ? "#E2E8F0" : "#E8ECFF", color: optional ? "#475569" : "#4F6BFF" }}
          data-anchor="required"
        >
          {el.required}
        </span>
      </div>
    </div>
  );
}
