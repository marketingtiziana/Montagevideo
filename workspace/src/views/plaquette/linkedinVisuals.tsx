import { NAVY, Wordmark } from './kit'
import type { LfTexts } from '../../lib/seed/linkedinFn'

/* Native-size LinkedIn visuals (exported as PNG by scripts/export-plaquettes.cjs). */

export const LF_BANNER = { w: 1128, h: 191 }
export const LF_LOGO = { w: 400, h: 400 }
export const LF_POST = { w: 1080, h: 1080 }

export function LfBanner({ t }: { t: LfTexts }) {
  const domains = t.banner.domains.split('|').map((s) => s.trim()).filter(Boolean)
  return (
    <div data-asset="lf-banner" style={{ width: 1128, height: 191, background: NAVY, position: 'relative', overflow: 'hidden', fontFamily: 'Inter Variable, Inter, sans-serif', color: '#fff' }}>
      {/* architectural rhythm, kept in the area covered by the logo */}
      {[0, 60, 120, 180].map((x) => (
        <div key={x} style={{ position: 'absolute', top: 0, bottom: 0, left: x, width: 1, background: 'rgba(255,255,255,0.08)' }} />
      ))}
      <div style={{ position: 'absolute', left: 240, right: 56, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', textAlign: 'right' }}>
        <Wordmark width={250} />
        <div style={{ marginTop: 18, fontSize: 22, fontWeight: 500, lineHeight: 1.25, letterSpacing: '-0.005em', whiteSpace: 'nowrap' }}>{t.banner.message}</div>
        <div style={{ marginTop: 14, display: 'flex', gap: 14, alignItems: 'center', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)' }}>
          {domains.map((d, i) => (
            <span key={d} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {i > 0 && <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.35)' }} />}
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LfLogo() {
  return (
    <div data-asset="lf-logo" style={{ width: 400, height: 400, background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Wordmark width={340} />
    </div>
  )
}

const V = { kicker: { fontSize: 22, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase' as const } }

function Frame({ kicker, title, dark, children, foot }: { kicker: string; title: string; dark?: boolean; children: React.ReactNode; foot: string }) {
  const fg = dark ? '#fff' : NAVY
  return (
    <div style={{ width: 1080, height: 1080, background: dark ? NAVY : '#fff', color: fg, fontFamily: 'Inter Variable, Inter, sans-serif', padding: '72px 80px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 26, borderBottom: `1.5px solid ${dark ? 'rgba(255,255,255,0.18)' : 'rgba(13,8,46,0.14)'}` }}>
        <Wordmark width={230} tone={dark ? 'white' : 'navy'} />
        <span style={{ ...V.kicker, color: dark ? 'rgba(255,255,255,0.65)' : 'rgba(13,8,46,0.6)' }}>{kicker}</span>
      </div>
      <div style={{ marginTop: 56, fontSize: 60, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.015em' }}>{title}</div>
      <div style={{ marginTop: 48, flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(13,8,46,0.5)' }}>
        <span>{foot}</span>
        <span>fynovates.com</span>
      </div>
    </div>
  )
}

const row = (n: string, title: string, dark = false) => (
  <div key={n} style={{ display: 'flex', gap: 28, alignItems: 'baseline', padding: '26px 0', borderTop: `1.5px solid ${dark ? 'rgba(255,255,255,0.14)' : 'rgba(13,8,46,0.12)'}` }}>
    <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: '0.12em', opacity: 0.55, fontVariantNumeric: 'tabular-nums' }}>{n}</span>
    <span style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.2 }}>{title}</span>
  </div>
)

export function LfPostVisual({ i, t }: { i: number; t: LfTexts }) {
  const p = t.posts[i]
  const foot = 'Information générale · chaque situation demande une analyse'
  if (i === 0)
    return (
      <Frame kicker={p.visualKicker} title={p.visualTitle} foot={foot}>
        {['Où se trouvent réellement vos clients ?', 'Quel régime de TVA pour vos ventes ?', 'Où votre activité est-elle exercée et dirigée ?'].map((x, k) => row(`0${k + 1}`, x))}
        <div style={{ marginTop: 'auto', marginBottom: 36, background: NAVY, color: '#fff', padding: '30px 36px', fontSize: 30, fontWeight: 500, lineHeight: 1.3 }}>Le pays de la société est une conséquence, pas un point de départ.</div>
      </Frame>
    )
  if (i === 1)
    return (
      <Frame kicker={p.visualKicker} title={p.visualTitle} dark foot={foot}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {['Le projet de départ', 'La résidence fiscale', 'Les conséquences fiscales', 'L’organisation du changement', 'Les erreurs de préparation', 'La synthèse avant décision'].map((x, k) => (
            <div key={x} style={{ border: '1.5px solid rgba(255,255,255,0.2)', padding: '26px 28px', minHeight: 120 }}>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '0.14em', opacity: 0.6 }}>0{k + 1}</div>
              <div style={{ marginTop: 10, fontSize: 32, fontWeight: 600, lineHeight: 1.2 }}>{x}</div>
            </div>
          ))}
        </div>
      </Frame>
    )
  if (i === 2)
    return (
      <Frame kicker={p.visualKicker} title={p.visualTitle} foot={foot}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1.5px solid rgba(13,8,46,0.14)' }}>
          {[
            ['Activité', 'Modèle économique réel'],
            ['Fonds', 'Origine et circulation'],
            ['Structure', 'Société et bénéficiaires'],
            ['Pays', 'Clients et fournisseurs'],
          ].map(([a, b], k) => (
            <div key={a} style={{ padding: '34px 32px', borderRight: k % 2 === 0 ? '1.5px solid rgba(13,8,46,0.14)' : undefined, borderBottom: k < 2 ? '1.5px solid rgba(13,8,46,0.14)' : undefined }}>
              <div style={{ ...V.kicker, fontSize: 20, opacity: 0.6 }}>{a}</div>
              <div style={{ marginTop: 12, fontSize: 34, fontWeight: 600, lineHeight: 1.2 }}>{b}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', marginBottom: 36, background: NAVY, color: '#fff', padding: '30px 36px', fontSize: 30, fontWeight: 500, lineHeight: 1.3 }}>Un dossier clair et cohérent facilite l’échange avec la banque.</div>
      </Frame>
    )
  return (
    <Frame kicker={p.visualKicker} title={p.visualTitle} dark foot="Méthode Fynovates">
      {['Comprendre l’activité réelle', 'Vérifier les règles applicables', 'Faire relire par un second expert', 'Recommander par écrit'].map((x, k) => row(`0${k + 1}`, x, true))}
      <div style={{ marginTop: 'auto', marginBottom: 36, background: '#fff', color: NAVY, padding: '30px 36px', fontSize: 30, fontWeight: 500, lineHeight: 1.3 }}>Comprendre sa situation avant de décider.</div>
    </Frame>
  )
}
