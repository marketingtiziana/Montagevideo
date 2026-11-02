import type { CalloutElement, IconName } from "@/data/types";
import { Icon } from "../icons";

const TONES: Record<CalloutElement["tone"], { bg: string; fg: string; icon: IconName; chip: string }> = {
  remember: { bg: "#E8ECFF", fg: "#4F6BFF", icon: "pin", chip: "#4F6BFF" },
  trap: { bg: "#E2E8F0", fg: "#0F1535", icon: "alert-triangle", chip: "#64748B" },
  bad: { bg: "#FDECEC", fg: "#E5484D", icon: "x-circle", chip: "#E5484D" },
  good: { bg: "#E3F5EC", fg: "#30A46C", icon: "check-circle", chip: "#30A46C" },
};

export function Callout({ el }: { el: CalloutElement }) {
  const t = TONES[el.tone];
  return (
    <div className="rounded-2xl p-6 shadow-soft" style={{ background: t.bg, border: `2px solid ${t.fg}22` }}>
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: t.chip }}>
          <Icon name={t.icon} size={22} strokeWidth={2.5} />
        </span>
        <span className="text-[22px] font-extrabold uppercase tracking-wide" style={{ color: t.fg }}>
          {el.label}
        </span>
      </div>
      <div className="mt-3 text-[28px] font-black leading-tight text-navy" data-anchor="title">
        {el.title}
      </div>
      {el.body && (
        <p className="mt-3 text-[22px] leading-snug text-navy/85" data-anchor="body">
          {el.body}
        </p>
      )}
      {el.points && (
        <ol className="mt-3 space-y-2">
          {el.points.map((p, i) => (
            <li key={i} className="flex gap-3 text-[22px] leading-snug text-navy/90" data-anchor={`point-${i + 1}`}>
              <span
                className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[20px] font-black text-white"
                style={{ background: t.chip }}
              >
                {i + 1}
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
