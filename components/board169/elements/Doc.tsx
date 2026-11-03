import type { DocElement } from "@/data/board169-types";

/** Faux document : en-tête, lignes grises, tampon. Aucun logo réel. */
export function Doc({ el }: { el: DocElement }) {
  const lines = el.lines ?? 5;
  return (
    <div className="relative rounded-xl border border-[#E3E6EE] bg-white px-5 pb-4 pt-3.5 shadow-card">
      <div className="border-b-2 border-navy pb-2">
        <div className="text-[24px] font-black leading-tight text-navy">{el.title}</div>
        <div className="text-[20px] leading-snug text-slate">{el.subtitle}</div>
      </div>
      <div className="mt-3 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-2.5 rounded-full bg-[#E3E6EE]" style={{ width: `${[92, 78, 86, 60, 70, 82][i % 6]}%` }} />
        ))}
      </div>
      {el.stamp && (
        <span className="absolute bottom-3 right-4 rotate-[-6deg] rounded-md border-[3px] border-indigo px-2 py-0.5 text-[20px] font-black uppercase tracking-wider text-indigo">
          {el.stamp}
        </span>
      )}
    </div>
  );
}
