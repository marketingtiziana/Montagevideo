export interface NavItem {
  path: string
  label: string
}
export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV: NavGroup[] = [
  { label: 'Overview', items: [{ path: '/', label: 'Strategic Overview' }] },
  {
    label: 'Strategy',
    items: [
      { path: '/map', label: 'Master Mind Map' },
      { path: '/brands', label: 'Brand Architecture' },
      { path: '/pillars', label: 'Editorial Pillars' },
      { path: '/insights', label: 'Prospect Insights' },
    ],
  },
  {
    label: 'Channels',
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
    label: 'Creative Studio',
    items: [
      { path: '/art-direction', label: 'Art Direction' },
      { path: '/library', label: 'Creative Library' },
      { path: '/references', label: 'Visual References' },
      { path: '/infographics', label: 'Infographics' },
      { path: '/carousels', label: 'Carousels' },
      { path: '/storyboards', label: 'Storyboards' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/database', label: 'Content Database' },
      { path: '/board', label: 'Production Board' },
      { path: '/stories', label: 'Story Sequences' },
      { path: '/matrix', label: 'Repurposing Matrix' },
      { path: '/journeys', label: 'Conversion Journeys' },
    ],
  },
]

export function findNav(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of NAV)
    for (const item of group.items) if (item.path === pathname) return { group, item }
  return null
}
