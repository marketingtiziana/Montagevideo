import type { DocElement } from "@/data/types";

/** Faux document officiel : en-tête, titre, lignes, tampon. */
export function Doc({ el }: { el: DocElement }) {
  return (
    <div className="ui relative rounded-lg border border-[#e4e4e2] bg-white px-4 pb-4 pt-3 shadow-soft">
      <div className="flex items-center justify-between border-b border-[#1d1d1f] pb-1.5 text-[10px] uppercase tracking-[0.14em] text-[#6b6b70]">
        <span>{el.header}</span>
        <span className="h-1.5 w-10 rounded-full bg-[#e4e4e2]" />
      </div>
      <div className="mt-2 text-[15px] font-bold leading-tight text-[#1d1d1f]">{el.title}</div>
      <div className="mt-2 space-y-1.5">
        {el.lines.map((l, i) => (
          <div key={i} className="text-[12px] leading-snug text-[#4b4b50]">
            {l}
          </div>
        ))}
        <div className="h-1.5 w-[70%] rounded-full bg-[#ececea]" />
        <div className="h-1.5 w-[55%] rounded-full bg-[#ececea]" />
      </div>
      {el.stamp && (
        <span className="absolute bottom-3 right-3 rounded border-2 border-[#2F6FE4] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2F6FE4]">
          {el.stamp}
        </span>
      )}
    </div>
  );
}
