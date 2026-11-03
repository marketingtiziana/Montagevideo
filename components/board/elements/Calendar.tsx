import type { CalendarElement } from "@/data/types";

/** Faux calendrier d'une année, points de suivi en vert. */
export function Calendar({ el }: { el: CalendarElement }) {
  const marks = new Set(el.marks.map((m) => `${m.month}-${m.day}`));
  return (
    <div className="ui rounded-lg border border-[#e4e4e2] bg-white p-3 shadow-soft">
      <div className="px-1 pb-2 text-[13px] font-semibold text-[#1d1d1f]">{el.title}</div>
      <div className="grid grid-cols-4 gap-2">
        {el.months.map((name, m) => (
          <div key={m} className="rounded-md border border-[#efefed] p-1.5">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#6b6b70]">{name}</div>
            <div className="grid grid-cols-7 gap-[2px]">
              {Array.from({ length: 30 }).map((_, d) => {
                const marked = marks.has(`${m}-${d + 1}`);
                return <span key={d} className="h-[5px] w-[5px] rounded-full" style={{ background: marked ? "#3CA55C" : "#e9e9e6", transform: marked ? "scale(1.5)" : undefined }} />;
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5 px-1 text-[11px] text-[#6b6b70]">
        <span className="inline-block h-2 w-2 rounded-full bg-[#3CA55C]" /> {el.legend}
      </div>
    </div>
  );
}
