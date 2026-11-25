import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useMindmap } from '../../lib/mindmap/store'
import { CLAIM_LABEL, publicCopy } from '../../lib/mindmap/types'
import { logoUrl } from '../../lib/mindmap/layout'
import { FocusLayer, OverviewLayer, ScaledStage, StatusTag } from './Stage'
import './mindmap.css'

const noop = () => {}

/** 4:3 PDF: overview, one page per branch, then the sources register. Private notes are stripped. */
export default function PrintMap() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const stored = useMindmap(id)
  const map = stored ? publicCopy(stored) : stored

  useEffect(() => {
    if (!map || sp.get('autoprint') !== '1') return
    const t = setTimeout(() => window.print(), 900)
    return () => clearTimeout(t)
  }, [map, sp])

  if (!map) return null
  return (
    <div className="mm-print mm-noanim" data-print-ready>
      <style>{`@page { size: 2048px 1536px; margin: 0 } html, body { background: #0F0A13 }`}</style>
      <Page>
        <OverviewLayer map={map} />
      </Page>
      {map.branches.map((b) => (
        <Page key={b.id}>
          <FocusLayer map={map} branch={b} onBranch={noop} onNode={noop} onCentre={noop} />
        </Page>
      ))}
      <Page>
        <div className="absolute" style={{ left: 96, top: 88, right: 96, bottom: 88 }}>
          <div className="flex items-center justify-between">
            <img src={logoUrl} alt="FYNOVATES" style={{ width: 280 }} />
            <span className="mm-eyebrow">Carte {map.number} · sources et validation</span>
          </div>
          <h2 className="mt-12 text-[48px] font-semibold leading-tight">{map.title}</h2>
          <p className="mt-4 max-w-[1500px] text-[22px] leading-snug text-white/70">
            Aucun taux, seuil, délai ni montant n’est affirmé. Chaque affirmation reste à vérifier par un professionnel compétent à la date de publication. {map.disclaimer}
          </p>
          <div className="mt-10 grid grid-cols-2 gap-x-10 gap-y-6">
            {map.claims.map((c) => (
              <div key={c.id} className="mm-claim">
                <div className="flex items-center gap-4">
                  <StatusTag status={c.status} />
                  <span className="text-[17px] text-white/50">
                    {c.id} · {CLAIM_LABEL[c.status]}
                  </span>
                </div>
                <p className="text-[19px] leading-snug text-white/85">{c.text}</p>
                <p className="text-[16px] text-white/55">
                  {c.jurisdiction} · {c.reference || 'Référence : À RENSEIGNER'} · {c.url || 'Lien : À RENSEIGNER'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Page>
    </div>
  )
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <section className="mm-print-page">
      <ScaledStage>{children}</ScaledStage>
    </section>
  )
}
