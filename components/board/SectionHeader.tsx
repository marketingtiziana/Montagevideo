import type { Section } from "@/data/types";
import { rngFor } from "@/lib/rng";

export function SectionHeader({ section }: { section: Section }) {
  const r = rngFor(`header/${section.id}`);
  const rotate = r.range(-2, 2);
  const offset = Math.round(r.range(0, 40));
  const left = section.side === "left";
  return (
    <div className="relative grid" style={{ gridTemplateColumns: "540px 540px", minHeight: 170 }}>
      <div
        data-node={section.id}
        className="absolute flex h-[66px] w-[66px] items-center justify-center text-[30px] font-black text-white"
        style={{ left: 540 - 33, top: 52 }}
      >
        {section.number}
      </div>
      <div
        data-title={section.id}
        className={left ? "col-start-1 justify-self-end" : "col-start-2 justify-self-start"}
        style={{
          marginRight: left ? 72 : undefined,
          marginLeft: left ? undefined : 72,
          marginTop: 30 + offset,
          transform: `rotate(${rotate}deg)`,
          maxWidth: 440,
        }}
      >
        {section.kicker && (
          <div className="text-[22px] font-extrabold uppercase tracking-[0.14em]" style={{ color: section.color }}>
            {section.kicker}
          </div>
        )}
        <h2 className="text-[46px] font-black leading-[1.02] tracking-tight text-navy">{section.title}</h2>
      </div>
    </div>
  );
}
