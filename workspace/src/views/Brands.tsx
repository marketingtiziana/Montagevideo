import { Page } from '../components/AppShell'
import { Thumb } from '../components/images/Thumb'
import { StrategySections } from '../components/StrategySections'
import { Loading, PageHeader, Section, TextArea } from '../components/ui'
import { BRANDS } from '../lib/constants'
import { db } from '../lib/db'
import { useDetail } from '../lib/detail'
import { useBrands, useImages } from '../lib/hooks'

export default function Brands() {
  const brands = useBrands()
  const images = useImages()
  const { open } = useDetail()
  if (!brands || !images) return <Loading />
  return (
    <Page>
      <PageHeader
        eyebrow="Strategy"
        title="Brand Architecture"
        description="Deux identités distinctes. Fynovates parle en cabinet, Tiziana parle en dirigeante. La direction artistique de cet outil n’est celle d’aucune des deux marques."
      />
      <div className="grid gap-10 xl:grid-cols-2">
        {brands.map((b) => (
          <div key={b.id}>
            <div className="mb-5 border-b border-line pb-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-6 w-1 rounded-full" style={{ background: BRANDS[b.id].color }} />
                <span className="eyebrow">{b.id === 'FN' ? 'Marque cabinet' : 'Personal branding'}</span>
              </div>
              <h2 className="display text-[36px] leading-none">{b.name}</h2>
              <div className="mt-1 text-[13px] text-ink-3">{b.descriptor}</div>
              <TextArea
                className="mt-3 !border-transparent !bg-transparent !px-0 text-[14px] leading-relaxed hover:!border-line focus:!px-2"
                value={b.positioning}
                rows={2}
                onCommit={(v) => db.brands.update(b.id, { positioning: v })}
              />
            </div>
            <StrategySections columns={1} sections={b.sections} onChange={(s) => db.brands.update(b.id, { sections: s })} />
            <Section title="Références de marque" className="mt-6">
              <div className="grid grid-cols-3 gap-3">
                {images
                  .filter((i) => i.brand === b.id && (i.type === 'ref-corporate' || i.id === 'IMG-001' || i.id === 'IMG-002' || i.id === 'IMG-003'))
                  .map((i) => (
                    <button key={i.id} type="button" onClick={() => open('i', i.id)} className="overflow-hidden rounded-lg border border-line bg-surface text-left">
                      <Thumb img={i} className="aspect-[4/3] w-full object-top" />
                      <div className="px-2 py-1 font-mono text-[10.5px] text-ink-3">{i.id}</div>
                    </button>
                  ))}
              </div>
            </Section>
          </div>
        ))}
      </div>
    </Page>
  )
}
