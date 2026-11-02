import type { ChartElement } from "@/data/types";

/** Graphiques SVG dessinés à la main : implémentation complète à l'étape 4. */
export function Chart({ el }: { el: ChartElement }) {
  return (
    <div className="rounded-2xl border border-[#E3E6EE] bg-white p-6 shadow-card">
      <div className="text-[24px] font-black text-navy">{el.title}</div>
    </div>
  );
}
