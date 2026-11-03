import type { TableElement } from "@/data/types";

/** Petit tableau à deux colonnes. */
export function Table({ el }: { el: TableElement }) {
  return (
    <div className="ui overflow-hidden rounded-lg border border-[#e4e4e2] bg-white shadow-soft">
      {el.title && <div className="border-b border-[#e4e4e2] bg-[#fafafa] px-3 py-2 text-[13px] font-semibold text-[#1d1d1f]">{el.title}</div>}
      <table className="w-full border-collapse text-[12.5px]">
        <tbody>
          {el.rows.map((r, i) => (
            <tr key={i} className={i % 2 ? "bg-[#fafafa]" : "bg-white"}>
              <td className="w-[38%] border-b border-[#efefed] px-3 py-2 align-top font-semibold leading-snug text-[#1d1d1f]">{r.label}</td>
              <td className="border-b border-[#efefed] px-3 py-2 align-top leading-snug text-[#4b4b50]">{r.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
