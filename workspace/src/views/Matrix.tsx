import { Page } from '../components/AppShell'
import { PageHeader, ValidationBadge } from '../components/ui'
import { PLATFORM_IDS, PLATFORMS } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { useMatrix } from '../lib/hooks'

export default function Matrix() {
  const matrix = useMatrix()
  const { open } = useDetail()
  return (
    <Page wide>
      <PageHeader
        eyebrow="Idées de contenus"
        title="Déclinaisons"
        description="Comment un même sujet se décline sur chaque plateforme, avec un angle et un format propres. Clique sur une case pour ouvrir l’idée correspondante."
      />
      <div className="overflow-x-auto rounded-xl border border-line bg-surface scroll-thin">
        <table className="w-full min-w-[1180px] border-collapse">
          <thead>
            <tr className="bg-surface-2">
              <th className="sticky left-0 z-10 w-[210px] border-b border-r border-line bg-surface-2 px-3 py-2.5 text-left text-[11px] font-medium text-ink-3">Sujet</th>
              {PLATFORM_IDS.map((p) => (
                <th key={p} className="border-b border-line px-3 py-2.5 text-left text-[11px] font-medium text-ink-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: PLATFORMS[p].color }} />
                    {PLATFORMS[p].label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="sticky left-0 z-10 border-b border-r border-line bg-surface px-3 py-3">
                  <div className="text-[13px] font-semibold">{r.topic}</div>
                  <ValidationBadge value={r.validation} className="mt-1.5" />
                </td>
                {PLATFORM_IDS.map((p) => {
                  const cell = r.cells[p]
                  const filled = cell?.angle && cell.angle !== 'À RENSEIGNER'
                  const Tag = cell?.contentId ? 'button' : 'div'
                  return (
                    <td key={p} className="border-b border-line p-1.5">
                      <Tag
                        {...(cell?.contentId ? { type: 'button' as const, onClick: () => open('c', cell.contentId!) } : {})}
                        className={`flex min-h-[92px] w-full flex-col rounded-lg p-2.5 text-left ${filled ? 'bg-surface-2' : 'border border-dashed border-line-strong'} ${cell?.contentId ? 'hover:bg-surface-3' : ''}`}
                      >
                        {filled ? (
                          <>
                            <span className="text-[12.5px] leading-snug">{cell!.angle}</span>
                            {cell!.format && <span className="mt-1 text-[11px] text-ink-3">{cell!.format}</span>}
                            {cell!.contentId && <span className="mt-auto pt-2 font-mono text-[10.5px] text-ink-3">{cell!.contentId} →</span>}
                          </>
                        ) : (
                          <span className="m-auto text-[10.5px] font-semibold tracking-[0.05em] text-ink-3">À RENSEIGNER</span>
                        )}
                      </Tag>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11.5px] text-ink-3">« Compte bancaire et financement » reprend l’exemple du brief ; les autres lignes sont des propositions.</p>
    </Page>
  )
}
