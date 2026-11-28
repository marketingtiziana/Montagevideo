import { LF_DEFAULTS } from '../../lib/seed/linkedinFn'
import { YT_DEFAULTS, YT_SHORTS, YT_VIDEOS, YT_WELCOME } from '../../lib/seed/youtubeFn'
import { LfBanner, LfLogo, LfPostVisual } from './linkedinVisuals'
import { YtAvatar, YtBanner, YtEndScreen, YtShortThumb, YtThumb } from './youtubeVisuals'

/** Native-size render of every plaquette visual, used by scripts/export-plaquettes.cjs. */
export default function Assets() {
  const items: [string, React.ReactNode][] = [
    ['linkedin/banniere', <LfBanner t={LF_DEFAULTS} />],
    ['linkedin/logo', <LfLogo />],
    ...LF_DEFAULTS.posts.map((_, i) => [`linkedin/post-${i + 1}`, <LfPostVisual i={i} t={LF_DEFAULTS} />] as [string, React.ReactNode]),
    ['youtube/banniere', <YtBanner t={YT_DEFAULTS} />],
    ['youtube/banniere-zones', <YtBanner t={YT_DEFAULTS} safe />],
    ['youtube/photo-profil', <YtAvatar />],
    ['youtube/ecran-de-fin', <YtEndScreen t={YT_DEFAULTS} next={YT_VIDEOS[1]} />],
    ['youtube/miniature-v-welcome', <YtThumb v={YT_WELCOME} />],
    ...YT_VIDEOS.map((v) => [`youtube/miniature-${v.id}`, <YtThumb v={v} />] as [string, React.ReactNode]),
    ...YT_SHORTS.map((s) => [`youtube/short-${s.id}`, <YtShortThumb s={s} />] as [string, React.ReactNode]),
  ]
  return (
    <div style={{ background: '#fff', padding: 20 }} data-assets-ready>
      {items.map(([name, node]) => (
        <div key={name} data-export={name} style={{ display: 'inline-block', margin: 10, verticalAlign: 'top' }}>
          {node}
        </div>
      ))}
    </div>
  )
}
