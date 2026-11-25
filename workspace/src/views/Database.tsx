import { Page } from '../components/AppShell'
import { ContentTable } from '../components/content/ContentTable'
import { Loading, PageHeader } from '../components/ui'
import { useContents } from '../lib/hooks'

export default function Database() {
  const contents = useContents()
  if (!contents) return <Loading />
  return (
    <Page wide>
      <PageHeader
        eyebrow="Operations"
        title="Content Database"
        description="La base centrale des publications. FN = Fynovates, TZ = Tiziana, DB = déclinaison double. Toutes les vues lisent la même source : une modification ici se répercute partout."
      />
      <ContentTable contents={contents} />
    </Page>
  )
}
