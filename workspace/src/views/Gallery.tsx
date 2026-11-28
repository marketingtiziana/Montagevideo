import { useState } from 'react'
import { Page } from '../components/AppShell'
import { ImageTile } from '../components/Cards'
import { PageHeader, Section, Tabs } from '../components/ui'
import { isToClassify, useImages } from '../lib/hooks'

export default function Gallery() {
  const images = useImages()
  const [tab, setTab] = useState<'FN' | 'TZ' | 'tiers'>('FN')
  const groups = {
    FN: images.filter((i) => i.brand === 'FN'),
    TZ: images.filter((i) => i.brand === 'TZ'),
    tiers: images.filter(isToClassify),
  }
  const list = groups[tab]
  return (
    <Page wide>
      <PageHeader
        eyebrow="Direction artistique"
        title="Galerie visuelle"
        description="Toutes les références fournies (IMG-001 à IMG-035). Les captures de comptes tiers servent d’inspiration uniquement."
      />
      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'FN', label: 'Fynovates', count: groups.FN.length },
          { value: 'TZ', label: 'Tiziana', count: groups.TZ.length },
          { value: 'tiers', label: 'Inspirations (comptes tiers)', count: groups.tiers.length },
        ]}
      />
      <Section title={tab === 'tiers' ? 'Inspirations — à ne pas republier' : tab === 'FN' ? 'Maquettes et références Fynovates' : 'Planche Tiziana'}>
        <div className="columns-2 gap-4 md:columns-3 xl:columns-5">
          {list.map((i) => (
            <ImageTile key={i.id} img={i} natural />
          ))}
        </div>
      </Section>
    </Page>
  )
}
