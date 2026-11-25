import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Page } from '../../components/AppShell'
import { IdentityBar, useIdentity } from '../../components/brand/BrandParts'
import { Button, Confirm, EmptyState, Field, IconButton, Loading, PageHeader, Section, Select, TextArea, TextInput, useToast } from '../../components/ui'
import { resetMindmap, restoreMapVersion, saveMindmap, useMapVersions, useMindmap } from '../../lib/mindmap/store'
import { CLAIM_LABEL, CLAIM_STATUSES, emptyNotes, renumber, type Branch, type BranchNotes, type Claim, type ClaimStatus, type MindMap } from '../../lib/mindmap/types'
import { OverviewLayer, ScaledStage } from './Stage'
import './mindmap.css'

const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
const move = <T,>(a: T[], i: number, d: -1 | 1) => {
  const j = i + d
  if (j < 0 || j >= a.length) return a
  const b = [...a]
  ;[b[i], b[j]] = [b[j], b[i]]
  return b
}
const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)

export default function Editor() {
  const { id = '' } = useParams()
  const stored = useMindmap(id)
  const versions = useMapVersions(id)
  const ident = useIdentity()
  const toast = useToast()
  const [draft, setDraft] = useState<MindMap | null>(null)
  const [dirty, setDirty] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [label, setLabel] = useState('')
  const [delBranch, setDelBranch] = useState<Branch | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (stored && !dirty) setDraft(stored)
  }, [stored, dirty])

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  if (stored === undefined) return <Loading />
  if (stored === null || !draft) return <Page><EmptyState title="Carte introuvable" /></Page>

  const ro = !ident.canEdit
  const edit = (f: (m: MindMap) => MindMap) => {
    if (ro) return
    setDraft((m) => (m ? f(m) : m))
    setDirty(true)
  }
  const editBranch = (bid: string, patch: Partial<Branch>) => edit((m) => ({ ...m, branches: m.branches.map((b) => (b.id === bid ? { ...b, ...patch } : b)) }))
  const editNotes = (b: Branch, patch: Partial<BranchNotes>) => editBranch(b.id, { notes: { ...b.notes, ...patch } })
  const editClaim = (cid: string, patch: Partial<Claim>) => edit((m) => ({ ...m, claims: m.claims.map((c) => (c.id === cid ? { ...c, ...patch } : c)) }))

  const save = async () => {
    try {
      await saveMindmap(draft, label.trim() || 'Modification')
      setDirty(false)
      setLabel('')
      toast('Version enregistrée')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Enregistrement impossible', 'error')
    }
  }

  return (
    <Page wide>
      <PageHeader
        eyebrow={`Mindmap Studio · carte ${draft.number} · version ${draft.version}`}
        title="Éditeur de carte"
        description="Données structurées (JSON), jamais une image. Les modifications sont enregistrées dans ce navigateur, avec historique des versions. Une affirmation ne passe « VALIDATED » que par un valideur."
        actions={
          <>
            <Link to="/mindmaps">
              <Button>Studio</Button>
            </Link>
            <Link to={`/mindmaps/${id}/present`}>
              <Button>Présenter</Button>
            </Link>
          </>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <IdentityBar id={ident} />
        {ro && <span className="text-[12.5px] text-ink-3">Rôle lecteur : lecture seule.</span>}
      </div>

      <div className="sticky top-0 z-20 -mx-2 mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface/95 px-3 py-2 backdrop-blur" data-savebar>
        <span className="text-[12.5px] text-ink-2" data-dirty={dirty ? '1' : '0'}>
          {dirty ? 'Modifications non enregistrées' : 'Tout est enregistré'}
        </span>
        <input className="input !h-8 !w-[260px] text-[12.5px]" placeholder="Libellé de la version (facultatif)" value={label} onChange={(e) => setLabel(e.target.value)} disabled={ro} />
        <Button variant="primary" onClick={save} disabled={!dirty || ro} data-save>
          Enregistrer la version
        </Button>
        <Button
          variant="ghost"
          disabled={!dirty}
          onClick={() => {
            setDirty(false)
            setDraft(stored)
          }}
        >
          Annuler les modifications
        </Button>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <Section title="Carte">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Titre (sujet central)">
                <TextInput value={draft.title} onCommit={(v) => edit((m) => ({ ...m, title: v }))} />
              </Field>
              <Field label="Sous-titre">
                <TextInput value={draft.subtitle} onCommit={(v) => edit((m) => ({ ...m, subtitle: v }))} />
              </Field>
              <Field label="Objectif" className="md:col-span-2">
                <TextArea rows={2} value={draft.objective} onCommit={(v) => edit((m) => ({ ...m, objective: v }))} />
              </Field>
              <Field label="Avertissement" className="md:col-span-2">
                <TextArea rows={2} value={draft.disclaimer} onCommit={(v) => edit((m) => ({ ...m, disclaimer: v }))} />
              </Field>
            </div>
          </Section>

          <Section
            title={`Branches (${draft.branches.length})`}
            aside={
              <Button
                size="sm"
                disabled={ro}
                onClick={() => {
                  const nid = uid('b')
                  edit((m) => renumber({ ...m, branches: [...m.branches, { id: nid, num: '', title: 'Nouvelle branche', phrase: '', nodes: [], notes: emptyNotes(), privateNotes: '', claimIds: [] }] }))
                  setOpen(nid)
                }}
              >
                + Branche
              </Button>
            }
          >
            <div className="space-y-2">
              {draft.branches.map((b, i) => (
                <div key={b.id} className="rounded-lg border border-line bg-surface" data-edit-branch={b.id}>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="tabular w-7 text-[12px] font-semibold text-ink-3">{b.num}</span>
                    <button type="button" className="min-w-0 flex-1 truncate text-left text-[13.5px] font-medium text-ink" onClick={() => setOpen(open === b.id ? null : b.id)}>
                      {b.title} <span className="font-normal text-ink-3">· {b.nodes.length} nœuds</span>
                    </button>
                    <IconButton label="Monter" disabled={ro || i === 0} onClick={() => edit((m) => renumber({ ...m, branches: move(m.branches, i, -1) }))}>
                      ↑
                    </IconButton>
                    <IconButton label="Descendre" disabled={ro || i === draft.branches.length - 1} onClick={() => edit((m) => renumber({ ...m, branches: move(m.branches, i, 1) }))}>
                      ↓
                    </IconButton>
                    <IconButton label="Supprimer la branche" disabled={ro} onClick={() => setDelBranch(b)}>
                      ×
                    </IconButton>
                  </div>
                  {open === b.id && <BranchForm map={draft} b={b} ro={ro} editBranch={editBranch} editNotes={editNotes} />}
                </div>
              ))}
            </div>
          </Section>

          <Section
            title={`Affirmations et sources (${draft.claims.length})`}
            aside={
              <Button
                size="sm"
                disabled={ro}
                onClick={() =>
                  edit((m) => ({ ...m, claims: [...m.claims, { id: uid('C'), text: '', jurisdiction: '', date: 'À vérifier à la date de publication', source: '', reference: '', url: '', status: 'RESEARCH REQUIRED' }] }))
                }
              >
                + Affirmation
              </Button>
            }
          >
            <p className="mb-3 text-[12.5px] text-ink-3">Aucun taux, seuil, délai ni montant sans source officielle. Lien vide = À RENSEIGNER.</p>
            <div className="space-y-3">
              {draft.claims.map((c) => (
                <div key={c.id} className="rounded-lg border border-line bg-surface p-3" data-edit-claim={c.id}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="tabular text-[12px] font-semibold text-ink-3">{c.id}</span>
                    <Select<ClaimStatus>
                      className="!h-7 !w-[230px] !py-0 text-[12px]"
                      value={c.status}
                      onChange={(v) => {
                        if (!v) return
                        if (v === 'VALIDATED' && !ident.canApprove) return toast('Seul un valideur peut passer une affirmation en VALIDATED.', 'error')
                        editClaim(c.id, { status: v })
                      }}
                      options={CLAIM_STATUSES.map((s) => ({ value: s, label: `${s} — ${CLAIM_LABEL[s]}` }))}
                    />
                    <span className="flex-1" />
                    <IconButton
                      label="Supprimer l’affirmation"
                      disabled={ro}
                      onClick={() => edit((m) => ({ ...m, claims: m.claims.filter((x) => x.id !== c.id), branches: m.branches.map((b) => ({ ...b, claimIds: b.claimIds.filter((x) => x !== c.id) })) }))}
                    >
                      ×
                    </IconButton>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Field label="Affirmation" className="md:col-span-2">
                      <TextArea rows={2} value={c.text} onCommit={(v) => editClaim(c.id, { text: v })} />
                    </Field>
                    <Field label="Juridiction">
                      <TextInput value={c.jurisdiction} onCommit={(v) => editClaim(c.id, { jurisdiction: v })} />
                    </Field>
                    <Field label="Date d’application">
                      <TextInput value={c.date} onCommit={(v) => editClaim(c.id, { date: v })} />
                    </Field>
                    <Field label="Source officielle">
                      <TextInput value={c.source} onCommit={(v) => editClaim(c.id, { source: v })} />
                    </Field>
                    <Field label="Référence">
                      <TextInput value={c.reference} onCommit={(v) => editClaim(c.id, { reference: v })} />
                    </Field>
                    <Field label="Lien (URL officielle)" className="md:col-span-2">
                      <TextInput value={c.url} onCommit={(v) => editClaim(c.id, { url: v })} />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-16 xl:self-start">
          <Section title="Aperçu (brouillon)">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-[#0F0A13]" data-preview>
              <div className="pointer-events-none h-full">
                <ScaledStage>
                  <OverviewLayer map={draft} />
                </ScaledStage>
              </div>
            </div>
          </Section>
          <Section title="Versions" aside={<Button size="sm" variant="ghost" disabled={ro} onClick={() => setConfirmReset(true)}>Revenir à l’original</Button>}>
            <ul className="max-h-[420px] space-y-1 overflow-y-auto text-[12.5px]" data-versions>
              {(versions ?? []).map((v) => (
                <li key={v.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-ink">{v.label}</span>
                    <span className="text-[11px] text-ink-3">
                      v{v.data.version} · {new Date(v.savedAt).toLocaleString('fr-FR')} · {v.author}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={ro}
                    onClick={async () => {
                      await restoreMapVersion(v)
                      setDirty(false)
                      toast('Version restaurée')
                    }}
                  >
                    Restaurer
                  </Button>
                </li>
              ))}
              {versions?.length === 0 && <li className="text-ink-3">Aucune version enregistrée : la carte est celle du fichier JSON d’origine.</li>}
            </ul>
          </Section>
        </aside>
      </div>

      <Confirm
        open={!!delBranch}
        title="Supprimer la branche ?"
        message={`« ${delBranch?.title} » et ses ${delBranch?.nodes.length} nœuds seront retirés du brouillon. Rien n’est perdu tant que la version n’est pas enregistrée.`}
        onConfirm={() => {
          if (delBranch) edit((m) => renumber({ ...m, branches: m.branches.filter((b) => b.id !== delBranch.id) }))
          setDelBranch(null)
        }}
        onClose={() => setDelBranch(null)}
      />
      <Confirm
        open={confirmReset}
        title="Revenir à l’original ?"
        message="La version d’origine (fichier JSON) devient la version courante. L’historique est conservé."
        confirmLabel="Revenir à l’original"
        onConfirm={async () => {
          setConfirmReset(false)
          await resetMindmap(id)
          setDirty(false)
          toast('Carte d’origine restaurée')
        }}
        onClose={() => setConfirmReset(false)}
      />
    </Page>
  )
}

function BranchForm({
  map,
  b,
  ro,
  editBranch,
  editNotes,
}: {
  map: MindMap
  b: Branch
  ro: boolean
  editBranch: (id: string, p: Partial<Branch>) => void
  editNotes: (b: Branch, p: Partial<BranchNotes>) => void
}) {
  const n = b.notes
  const setNodes = (nodes: Branch['nodes']) => editBranch(b.id, { nodes })
  return (
    <div className="space-y-5 border-t border-line px-4 py-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Titre de la branche">
          <TextInput value={b.title} onCommit={(v) => editBranch(b.id, { title: v })} />
        </Field>
        <Field label="Phrase courte">
          <TextInput value={b.phrase} onCommit={(v) => editBranch(b.id, { phrase: v })} />
        </Field>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11.5px] font-medium text-ink-2">Nœuds secondaires ({b.nodes.length}) — 2 à 6 recommandés</span>
          <Button size="sm" disabled={ro} onClick={() => setNodes([...b.nodes, { id: uid(`${b.id}-n`), title: 'Nouveau nœud', detail: '' }])}>
            + Nœud
          </Button>
        </div>
        <div className="space-y-2">
          {b.nodes.map((nd, i) => (
            <div key={nd.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-md border border-line p-2" data-edit-node={nd.id}>
              <div className="grid gap-2 md:grid-cols-2">
                <TextInput value={nd.title} placeholder="Titre du nœud" onCommit={(v) => setNodes(b.nodes.map((x) => (x.id === nd.id ? { ...x, title: v } : x)))} />
                <TextInput value={nd.detail} placeholder="Détail (facultatif)" onCommit={(v) => setNodes(b.nodes.map((x) => (x.id === nd.id ? { ...x, detail: v } : x)))} />
              </div>
              <div className="flex items-center">
                <IconButton label="Monter" disabled={ro || i === 0} onClick={() => setNodes(move(b.nodes, i, -1))}>
                  ↑
                </IconButton>
                <IconButton label="Descendre" disabled={ro || i === b.nodes.length - 1} onClick={() => setNodes(move(b.nodes, i, 1))}>
                  ↓
                </IconButton>
                <IconButton label="Supprimer le nœud" disabled={ro} onClick={() => setNodes(b.nodes.filter((x) => x.id !== nd.id))}>
                  ×
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Idée clé" className="md:col-span-2">
          <TextArea rows={2} value={n.mainIdea} onCommit={(v) => editNotes(b, { mainIdea: v })} />
        </Field>
        <Field label="Points à développer (un par ligne, 3 à 5)" className="md:col-span-2">
          <TextArea rows={4} value={n.points.join('\n')} onCommit={(v) => editNotes(b, { points: lines(v) })} />
        </Field>
        <Field label="Explication">
          <TextArea rows={2} value={n.explanation} onCommit={(v) => editNotes(b, { explanation: v })} />
        </Field>
        <Field label="Exemple (anonymisé)">
          <TextArea rows={2} value={n.example} onCommit={(v) => editNotes(b, { example: v })} />
        </Field>
        <Field label="Nuance">
          <TextArea rows={2} value={n.nuance} onCommit={(v) => editNotes(b, { nuance: v })} />
        </Field>
        <Field label="Transition">
          <TextArea rows={2} value={n.transition} onCommit={(v) => editNotes(b, { transition: v })} />
        </Field>
        <Field label="Idées reçues (une par ligne)">
          <TextArea rows={2} value={n.misconceptions.join('\n')} onCommit={(v) => editNotes(b, { misconceptions: lines(v) })} />
        </Field>
        <Field label="Questions (une par ligne)">
          <TextArea rows={2} value={n.questions.join('\n')} onCommit={(v) => editNotes(b, { questions: lines(v) })} />
        </Field>
        <Field label="Conclusion de section" className="md:col-span-2">
          <TextInput value={n.conclusion} onCommit={(v) => editNotes(b, { conclusion: v })} />
        </Field>
        <Field label="Notes privées du présentateur (jamais exportées)" className="md:col-span-2">
          <TextArea rows={2} value={b.privateNotes} onCommit={(v) => editBranch(b.id, { privateNotes: v })} />
        </Field>
      </div>

      <div>
        <span className="mb-1.5 block text-[11.5px] font-medium text-ink-2">Affirmations liées</span>
        <div className="flex flex-wrap gap-1.5">
          {map.claims.map((c) => {
            const on = b.claimIds.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                disabled={ro}
                aria-pressed={on}
                title={c.text}
                onClick={() => editBranch(b.id, { claimIds: on ? b.claimIds.filter((x) => x !== c.id) : [...b.claimIds, c.id] })}
                className={`rounded-md border px-2 py-1 text-[11.5px] ${on ? 'border-ink bg-ink text-bg' : 'border-line text-ink-2'}`}
              >
                {c.id} · {c.reference || c.status}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
