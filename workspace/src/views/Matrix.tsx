import clsx from 'clsx'
import { Link2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Page } from '../components/AppShell'
import { EntityPicker } from '../components/EntityPicker'
import { Button, Confirm, Dialog, Field, IconButton, Loading, PageHeader, Select, TextInput, useToast } from '../components/ui'
import { createContent, createMatrixRow, deleteMatrixRow, updateMatrixRow } from '../lib/actions'
import { FORMATS, PLATFORM_IDS, PLATFORMS, STAGE_LABEL, VALIDATIONS } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { useById, useContents, useMatrix, useProblems } from '../lib/hooks'
import type { MatrixCell, MatrixRow, PlatformId, Validation } from '../lib/types'

export default function Matrix() {
  const matrix = useMatrix()
  const contents = useContents()
  const problems = useProblems()
  const cById = useById(contents)
  const pById = useById(problems)
  const { open } = useDetail()
  const toast = useToast()
  const [edit, setEdit] = useState<{ row: MatrixRow; p: PlatformId } | null>(null)
  const [del, setDel] = useState<MatrixRow | null>(null)
  const [pickProblems, setPickProblems] = useState<MatrixRow | null>(null)
  const [hover, setHover] = useState<string | null>(null)

  if (!matrix || !contents || !problems) return <Loading />

  return (
    <Page wide>
      <PageHeader
        eyebrow="Operations"
        title="Repurposing Matrix"
        description="Comment une problématique devient plusieurs contenus. Chaque cellule porte un angle et un format, et peut être reliée à un contenu existant ou en créer un."
        actions={
          <Button variant="primary" icon={<Plus size={14} />} onClick={async () => { await createMatrixRow('Nouveau sujet'); toast('Sujet ajouté') }}>
            Sujet
          </Button>
        }
      />
      <div className="overflow-x-auto rounded-xl border border-line bg-surface scroll-thin">
        <table className="w-full min-w-[1280px] border-collapse">
          <thead>
            <tr className="bg-surface-2">
              <th className="sticky left-0 z-10 w-[230px] border-b border-r border-line bg-surface-2 px-3 py-2.5 text-left text-[11px] font-medium text-ink-3">Sujet</th>
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
              <tr key={r.id} className="group align-top">
                <td className="sticky left-0 z-10 border-b border-r border-line bg-surface px-3 py-3">
                  <TextInput value={r.topic} onCommit={(v) => updateMatrixRow(r.id, { topic: v })} className="!border-transparent !px-0 text-[13px] font-semibold hover:!border-line focus:!px-2" />
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Select<Validation>
                      className="!h-6 !w-auto !py-0 !pl-1.5 text-[10.5px]"
                      value={r.validation}
                      onChange={(v) => v && updateMatrixRow(r.id, { validation: v })}
                      options={VALIDATIONS.map((v) => ({ value: v, label: v }))}
                    />
                    <IconButton label="Supprimer le sujet" className="opacity-0 group-hover:opacity-100" onClick={() => setDel(r)}>
                      <Trash2 size={12} />
                    </IconButton>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.problemIds.map((id) => (
                      <button key={id} type="button" onClick={() => open('p', id)} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-2 hover:text-ink" title={pById.get(id)?.title}>
                        {id}
                      </button>
                    ))}
                    <button type="button" onClick={() => setPickProblems(r)} className="rounded px-1 py-0.5 text-[10px] text-ink-3 hover:bg-surface-2 hover:text-ink">
                      + problématique
                    </button>
                  </div>
                </td>
                {PLATFORM_IDS.map((p) => {
                  const cell = r.cells[p]
                  const c = cell?.contentId ? cById.get(cell.contentId) : undefined
                  const k = `${r.id}:${p}`
                  return (
                    <td key={p} className="border-b border-line p-1.5" onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover(null)}>
                      <button
                        type="button"
                        onClick={() => setEdit({ row: r, p })}
                        className={clsx(
                          'flex h-full min-h-[104px] w-full flex-col rounded-lg p-2.5 text-left transition-colors',
                          cell?.angle && cell.angle !== 'À RENSEIGNER' ? 'bg-surface-2 hover:bg-surface-3' : 'border border-dashed border-line-strong hover:bg-surface-2',
                        )}
                      >
                        {cell?.angle ? (
                          <>
                            <span className={clsx('text-[12.5px] leading-snug', cell.angle === 'À RENSEIGNER' ? 'text-[11px] font-semibold tracking-[0.05em] text-ink-3' : 'text-ink')}>{cell.angle}</span>
                            {cell.format && <span className="mt-1 text-[11px] text-ink-3">{cell.format}</span>}
                            {c ? (
                              <span className="mt-auto pt-2 text-[10.5px] text-ink-2">
                                <span className="font-mono">{c.id}</span> · {STAGE_LABEL[c.status]}
                              </span>
                            ) : (
                              <span className="mt-auto pt-2 text-[10.5px] text-ink-3">{hover === k ? 'Relier / créer un contenu' : 'Aucun contenu'}</span>
                            )}
                          </>
                        ) : (
                          <span className="m-auto text-[11.5px] text-ink-3">+ Angle</span>
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11.5px] text-ink-3">
        La ligne « Compte bancaire et financement » reprend l’exemple validé du brief ; les autres lignes sont des propositions à arbitrer (statut affiché par ligne).
      </p>

      {edit && <CellEditor key={`${edit.row.id}:${edit.p}`} row={matrix.find((m) => m.id === edit.row.id) ?? edit.row} p={edit.p} onClose={() => setEdit(null)} />}
      <EntityPicker
        open={!!pickProblems}
        onClose={() => setPickProblems(null)}
        title="Problématiques du sujet"
        items={problems.map((p) => ({ id: p.id, label: p.title }))}
        selected={pickProblems?.problemIds ?? []}
        onChange={(ids) => pickProblems && updateMatrixRow(pickProblems.id, { problemIds: ids })}
      />
      <Confirm open={!!del} onClose={() => setDel(null)} title={`Supprimer « ${del?.topic} » ?`} message="Les contenus reliés ne sont pas supprimés." onConfirm={() => del && deleteMatrixRow(del.id)} />
    </Page>
  )
}

function CellEditor({ row, p, onClose }: { row: MatrixRow; p: PlatformId; onClose: () => void }) {
  const contents = useContents()
  const { open } = useDetail()
  const toast = useToast()
  const cell: MatrixCell = row.cells[p] ?? { angle: '', format: '', contentId: null }
  const [angle, setAngle] = useState(cell.angle)
  const [format, setFormat] = useState(cell.format)
  const [contentId, setContentId] = useState<string | null>(cell.contentId)
  const [pick, setPick] = useState(false)
  const linked = contentId ? contents?.find((c) => c.id === contentId) : undefined

  const save = async (patch: Partial<MatrixCell> = {}) => {
    await updateMatrixRow(row.id, { cells: { ...row.cells, [p]: { angle, format, contentId, ...patch } } })
  }

  return (
    <>
      <Dialog
        open
        onClose={onClose}
        title={`${row.topic} · ${PLATFORMS[p].label}`}
        footer={
          <>
            <Button
              variant="danger"
              className="mr-auto"
              onClick={async () => {
                const cells = { ...row.cells }
                delete cells[p]
                await updateMatrixRow(row.id, { cells })
                onClose()
              }}
            >
              Vider la cellule
            </Button>
            <Button onClick={onClose}>Annuler</Button>
            <Button
              variant="primary"
              onClick={async () => {
                await save()
                toast('Cellule enregistrée')
                onClose()
              }}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <Field label="Angle">
            <input className="input" value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="Ex. Analyse approfondie" autoFocus />
          </Field>
          <Field label="Format">
            <input className="input" value={format} onChange={(e) => setFormat(e.target.value)} placeholder="Ex. Long format" />
          </Field>
          <Field label="Contenu relié">
            {linked ? (
              <div className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[12.5px]">
                <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left hover:underline" onClick={() => open('c', linked.id)}>
                  <span className="font-mono text-ink-3">{linked.id}</span>
                  <span className="truncate">{linked.subject}</span>
                </button>
                <Button size="sm" variant="ghost" onClick={() => setContentId(null)}>
                  Délier
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" icon={<Link2 size={12} />} onClick={() => setPick(true)}>
                  Relier un contenu existant
                </Button>
                <Button
                  size="sm"
                  icon={<Plus size={12} />}
                  onClick={async () => {
                    const id = await createContent(PLATFORMS[p].brand, {
                      subject: `${row.topic} — ${angle || PLATFORMS[p].label}`,
                      angle,
                      platforms: [p],
                      problemIds: row.problemIds,
                      source: `Matrice de déclinaison — ${row.topic}`,
                    })
                    setContentId(id)
                    await save({ contentId: id })
                    toast(`${id} créé et relié`)
                  }}
                >
                  Créer le contenu
                </Button>
              </div>
            )}
          </Field>
        </div>
      </Dialog>
      <EntityPicker
        open={pick}
        onClose={() => setPick(false)}
        single
        title="Relier un contenu"
        items={(contents ?? []).map((c) => ({ id: c.id, label: c.subject, meta: FORMATS[c.format] }))}
        selected={contentId ? [contentId] : []}
        onChange={(ids) => setContentId(ids[0] ?? null)}
      />
    </>
  )
}
