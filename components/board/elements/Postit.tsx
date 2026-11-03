import type { PostitElement } from "@/data/types";

/** Post-it : les mots de la cible, en gros. */
export function Postit({ el }: { el: PostitElement }) {
  return (
    <div className="px-5 py-5 shadow-soft" style={{ background: el.color, borderRadius: 6 }}>
      <p className="font-semibold leading-snug text-[#1d1d1f]" style={{ fontSize: el.size ?? 20 }}>
        {el.text}
      </p>
    </div>
  );
}
