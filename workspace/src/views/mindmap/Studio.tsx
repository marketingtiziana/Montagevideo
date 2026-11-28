import { Link } from 'react-router-dom'
import { Page } from '../../components/AppShell'
import { Button, PageHeader, Section, useToast } from '../../components/ui'
import { downloadJson, downloadNotes, downloadPng, downloadSources, downloadSvg } from '../../lib/mindmap/browserExport'
import { useMindmaps } from '../../lib/mindmap/store'
import type { MindMap } from '../../lib/mindmap/types'
import { longforms } from '../../lib/seed/longform'
import { OverviewLayer, ScaledStage } from './Stage'
import './mindmap.css'

export default function Studio() {
  const maps = useMindmaps()
  return (
    <Page wide>
      <PageHeader
        eyebrow="Mindmap Studio"
        title="Cartes mentales iPad"
        description="Des cartes de présentation pour les vidéos de Tiziana (dispositif iPad + facecam). Format 4:3, plein écran, navigation tactile, mode présentateur avec notes. Les branches sont des propositions éditoriales, pas des conclusions juridiques : chaque affirmation fiscale porte sa source et son statut de validation."
      />
      <div className="grid gap-6 lg:grid-cols-2">{maps?.map((m) => <MapCard key={m.id} map={m} />)}</div>
      <Section title="Sur l’iPad" className="mt-10">
        <ul className="list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-ink-2">
          <li>Ouvrir la présentation, puis « Plein écran ». Pour un plein écran permanent : Safari → Partager → « Sur l’écran d’accueil ».</li>
          <li>Toucher une branche pour la déplier (Focus), toucher un nœud pour son détail, toucher le centre pour revenir à la vue d’ensemble.</li>
          <li>Pincer pour zoomer, glisser pour se déplacer une fois zoomé, « Réinitialiser » pour revenir à 100 %.</li>
          <li>« Masquer » cache tous les contrôles pendant le tournage ; toucher le coin supérieur droit pour les faire revenir.</li>
          <li>Le mode Présentateur affiche les points à développer et les notes privées : à garder pour l’écran de l’orateur, jamais à l’image.</li>
        </ul>
      </Section>
    </Page>
  )
}

function MapCard({ map }: { map: MindMap }) {
  const toast = useToast()
  const counts = {
    research: map.claims.filter((c) => c.status === 'RESEARCH REQUIRED').length,
    pending: map.claims.filter((c) => c.status === 'PENDING VALIDATION').length,
    ok: map.claims.filter((c) => c.status === 'VALIDATED').length,
  }
  const run = (f: () => unknown) => async () => {
    try {
      await f()
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Export impossible')
    }
  }
  return (
    <article className="card overflow-hidden" data-map-card={map.id}>
      <Link to={`/mindmaps/${map.id}/present`} className="block aspect-[4/3] bg-[#0F0A13]" aria-label={`Présenter : ${map.title}`}>
        <div className="pointer-events-none h-full">
          <ScaledStage>
            <OverviewLayer map={map} />
          </ScaledStage>
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div>
          <div className="eyebrow">Carte {map.number} · version {map.version} · {map.updatedAt}</div>
          <h2 className="mt-1.5 text-[19px] font-semibold leading-snug text-ink">{map.title}</h2>
          <p className="mt-1 text-[13.5px] text-ink-2">{map.subtitle}</p>
        </div>
        <p className="text-[12.5px] text-ink-3">
          {map.branches.length} branches · {map.branches.reduce((s, b) => s + b.nodes.length, 0)} nœuds · affirmations : {counts.research} recherche requise, {counts.pending} en attente de validation, {counts.ok} validée(s)
          {map.linkedLongForms.length > 0 && (
            <>
              {' '}
              · long format :{' '}
              {map.linkedLongForms.map((id) => (
                <Link key={id} to={`/longform?l=${id}`} className="underline underline-offset-2">
                  {id} {longforms.find((l) => l.id === id)?.title}
                </Link>
              ))}
            </>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to={`/mindmaps/${map.id}/present`}>
            <Button variant="primary">Présenter</Button>
          </Link>
          <Link to={`/mindmaps/${map.id}/present?mode=presenter`}>
            <Button>Mode présentateur</Button>
          </Link>
          <Link to={`/mindmaps/${map.id}/edit`}>
            <Button>Modifier</Button>
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-line pt-3 text-[12px]">
          <span className="mr-1 text-ink-3">Exporter :</span>
          <Link to={`/mindmaps/${map.id}/print?autoprint=1`} target="_blank">
            <Button size="sm">PDF</Button>
          </Link>
          <Button size="sm" onClick={run(() => downloadPng(map))}>
            PNG
          </Button>
          <Button size="sm" onClick={run(() => downloadSvg(map))}>
            SVG
          </Button>
          <Button size="sm" onClick={run(() => downloadJson(map))}>
            JSON
          </Button>
          <Button size="sm" onClick={run(() => downloadNotes(map))}>
            Notes (MD)
          </Button>
          <Button size="sm" onClick={run(() => downloadSources(map))}>
            Sources (MD)
          </Button>
          <span className="text-[11px] text-ink-3">Les notes privées ne sont jamais exportées.</span>
        </div>
      </div>
    </article>
  )
}
