import { useParams } from 'react-router-dom'
import { Page } from '../components/AppShell'
import { ContentTable } from '../components/content/ContentTable'
import { ImageCard } from '../components/images/ImageCard'
import { Placeholder, Thumb } from '../components/images/Thumb'
import { StrategySections } from '../components/StrategySections'
import { EmptyState, Loading, PageHeader, Section, TextArea } from '../components/ui'
import { BRANDS, PLATFORMS } from '../lib/constants'
import { db } from '../lib/db'
import { useDetail } from '../lib/detail'
import { useChannels, useContents, useImageUsage, useImages } from '../lib/hooks'
import type { PlatformId } from '../lib/types'

export default function Channel() {
  const { id } = useParams<{ id: PlatformId }>()
  const channels = useChannels()
  const contents = useContents()
  const images = useImages()
  const usage = useImageUsage(contents)
  if (!channels || !contents || !images) return <Loading />
  const ch = channels.find((c) => c.id === id)
  if (!ch || !id) return <Page><EmptyState title="Canal introuvable" /></Page>
  const list = contents.filter((c) => c.platforms.includes(id))
  const refs = images.filter((i) => i.platform === id)
  const p = PLATFORMS[id]

  return (
    <Page wide>
      <PageHeader
        eyebrow={`${p.network} · ${BRANDS[p.brand].label}`}
        title={ch.name}
        description={
          <TextArea
            className="!border-transparent !bg-transparent !px-0 text-[14px] leading-relaxed hover:!border-line focus:!px-2"
            rows={1}
            value={ch.role}
            onCommit={(v) => db.channels.update(ch.id, { role: v })}
          />
        }
      />
      {id === 'ig-tz' && <TizianaFeed />}
      <Section title="Stratégie de la plateforme">
        <StrategySections columns={3} sections={ch.sections} onChange={(s) => db.channels.update(ch.id, { sections: s })} />
      </Section>
      <Section title={`Contenus (${list.length})`}>
        <ContentTable contents={list} showViews={false} defaultCreate={{ kind: p.brand, platforms: [id] }} />
      </Section>
      <Section title={`Références visuelles (${refs.length})`}>
        {refs.length === 0 ? (
          <EmptyState title="Aucune référence classée sur cette plateforme" description="Importe des images depuis Creative Library et associe-les à cette plateforme." />
        ) : (
          <div className="columns-2 gap-4 md:columns-3 xl:columns-4">
            {refs.map((i) => (
              <ImageCard key={i.id} img={i} usage={usage.get(i.id)?.length} natural />
            ))}
          </div>
        )}
      </Section>
    </Page>
  )
}

/** Modèle E — Feed Tiziana : grille 3×3 alimentée uniquement par des photos réelles importées. */
export function TizianaFeed() {
  const images = useImages()
  const { open } = useDetail()
  const photos = (images ?? []).filter((i) => i.type === 'photo-tiziana' && i.validation === 'PHOTO RÉELLE TIZIANA')
  const cells = Array.from({ length: 9 }, (_, i) => photos[i] ?? null)
  return (
    <Section title="Modèle E — Feed Tiziana (3 × 3)" aside={<span className="text-[11.5px] text-ink-3">{photos.length} photo(s) réelle(s) importée(s)</span>}>
      <div className="grid gap-6 md:grid-cols-[minmax(0,420px)_1fr]">
        <div className="grid grid-cols-3 gap-[3px] overflow-hidden rounded-lg border border-line bg-line">
          {cells.map((img, i) =>
            img ? (
              <button key={img.id} type="button" onClick={() => open('i', img.id)} className="aspect-[4/5] bg-surface">
                <Thumb img={img} className="h-full w-full" />
              </button>
            ) : (
              <Placeholder key={i} label="PHOTO RÉELLE À IMPORTER" className="aspect-[4/5]" />
            ),
          )}
        </div>
        <div className="space-y-2 text-[12.5px] leading-relaxed text-ink-2">
          <p>
            Cette grille n’affiche que des images importées avec le type <b>Photo réelle Tiziana</b> et le statut <b>PHOTO RÉELLE TIZIANA</b>.
            Aucun visuel n’est généré ni substitué.
          </p>
          <p>
            La planche IMG-002 montre une proposition de feed de 15 photographies, mais les fichiers individuels n’ont pas été fournis : importe-les
            depuis Creative Library puis classe-les pour remplir la grille.
          </p>
          <p className="text-ink-3">Feed : photographies uniquement — aucun texte incrusté, aucun montage, aucun logo Fynovates, carrousels exclusivement photographiques.</p>
        </div>
      </div>
    </Section>
  )
}
