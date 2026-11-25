export interface NavItem {
  path: string
  label: string
}
export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV: NavGroup[] = [
  {
    label: 'Accueil',
    items: [
      { path: '/', label: 'Vue d’ensemble' },
      { path: '/map', label: 'Carte stratégique' },
    ],
  },
  {
    label: 'Stratégie',
    items: [
      { path: '/brand/FN', label: 'Fynovates' },
      { path: '/brand/TZ', label: 'Tiziana / Madame Caci' },
      { path: '/insights', label: 'Problématiques prospects' },
      { path: '/journeys', label: 'Parcours & CTA' },
      { path: '/rhythm', label: 'Rythme de publication' },
    ],
  },
  {
    label: 'Plateformes',
    items: [
      { path: '/channel/yt-fn', label: 'YouTube Fynovates' },
      { path: '/channel/ig-fn', label: 'Instagram Fynovates' },
      { path: '/channel/tt-fn', label: 'TikTok Fynovates' },
      { path: '/channel/li-fn', label: 'LinkedIn Fynovates' },
      { path: '/channel/ig-tz', label: 'Instagram Tiziana' },
      { path: '/channel/li-tz', label: 'LinkedIn Tiziana' },
    ],
  },
  {
    label: 'Direction artistique',
    items: [
      { path: '/da/FN', label: 'Charte Fynovates' },
      { path: '/da/TZ', label: 'Charte Tiziana' },
      { path: '/templates', label: 'Templates' },
      { path: '/gallery', label: 'Galerie visuelle' },
    ],
  },
  {
    label: 'Idées de contenus',
    items: [
      { path: '/longform', label: 'Long formats YouTube' },
      { path: '/ideas', label: 'Idées par plateforme' },
      { path: '/matrix', label: 'Déclinaisons' },
    ],
  },
]

export function findNav(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of NAV) for (const item of group.items) if (item.path === pathname) return { group, item }
  return null
}
