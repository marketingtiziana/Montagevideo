import type { SchemaElement } from "@/data/types";

/** Mini-schémas SVG : implémentation complète à l'étape 3. */
export function Schema({ el }: { el: SchemaElement }) {
  return (
    <div className="rounded-2xl border border-[#E3E6EE] bg-white px-5 py-4 shadow-card">
      <div className="text-[24px] font-black leading-tight text-navy">{el.title}</div>
    </div>
  );
}
