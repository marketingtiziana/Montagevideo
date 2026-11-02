import type { NoteElement, NoteTone } from "@/data/types";

const TONES: Record<NoteTone, { bg: string; fg: string }> = {
  indigo: { bg: "#E8ECFF", fg: "#4F6BFF" },
  sky: { bg: "#E0F2FE", fg: "#2B8FD6" },
  slate: { bg: "#E2E8F0", fg: "#475569" },
  mint: { bg: "#D9F5EE", fg: "#1F8F6A" },
};

export function Note({ el }: { el: NoteElement }) {
  const t = TONES[el.tone];
  return (
    <div className="rounded-2xl px-5 py-4 shadow-soft" style={{ background: t.bg }}>
      <div className="text-[24px] font-black leading-tight text-navy">{el.title}</div>
      {el.line && <p className="mt-1.5 text-[20px] leading-snug text-navy/80">{el.line}</p>}
      {el.chips && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {el.chips.map((c) => (
            <span key={c} className="rounded-full bg-white px-3 py-0.5 text-[20px] font-bold leading-tight" style={{ color: t.fg }}>
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
