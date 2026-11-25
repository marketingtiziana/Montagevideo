import { Component, lazy, Suspense, type ReactNode } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell, Page } from './components/AppShell'
import { Button, EmptyState, Loading, ToastProvider } from './components/ui'
import Brand from './views/Brand'
import Channel from './views/Channel'
import Charter from './views/Charter'
import Gallery from './views/Gallery'
import Ideas from './views/Ideas'
import Insights from './views/Insights'
import Journeys from './views/Journeys'
import LongForms from './views/LongForms'
import Matrix from './views/Matrix'
import Overview from './views/Overview'
import RhythmView from './views/Rhythm'
import Templates from './views/Templates'
import BrandDoc from './views/brand/BrandDoc'
import { ContextPack, PrintDoc, Register } from './views/brand/BrandExtras'
import BrandHome from './views/brand/BrandHome'

const MindMap = lazy(() => import('./views/MindMap'))
const MindmapStudio = lazy(() => import('./views/mindmap/Studio'))
const MindmapEditor = lazy(() => import('./views/mindmap/Editor'))
const MindmapPresent = lazy(() => import('./views/mindmap/Present'))
const MindmapPrint = lazy(() => import('./views/mindmap/PrintMap'))

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error)
      return (
        <Page>
          <EmptyState
            title="Cette page a rencontré une erreur"
            description={this.state.error.message}
            action={<Button onClick={() => this.setState({ error: null })}>Réessayer</Button>}
          />
        </Page>
      )
    return this.props.children
  }
}

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route path="/brand-strategy/:doc/print" element={<PrintDoc />} />
          <Route path="/mindmaps/:id/present" element={<Suspense fallback={null}><MindmapPresent /></Suspense>} />
          <Route path="/mindmaps/:id/print" element={<Suspense fallback={null}><MindmapPrint /></Suspense>} />
          <Route
            path="*"
            element={
        <AppShell>
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/map" element={<MindMap />} />
                <Route path="/brand/:id" element={<Brand />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/journeys" element={<Journeys />} />
                <Route path="/rhythm" element={<RhythmView />} />
                <Route path="/channel/:id" element={<Channel />} />
                <Route path="/da/:id" element={<Charter />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/longform" element={<LongForms />} />
                <Route path="/ideas" element={<Ideas />} />
                <Route path="/matrix" element={<Matrix />} />
                <Route path="/mindmaps" element={<MindmapStudio />} />
                <Route path="/mindmaps/:id/edit" element={<MindmapEditor />} />
                <Route path="/brand-strategy" element={<BrandHome />} />
                <Route path="/brand-strategy/register" element={<Register />} />
                <Route path="/brand-strategy/context" element={<ContextPack />} />
                <Route path="/brand-strategy/assets" element={<BrandDoc docOverride="assets" />} />
                <Route path="/brand-strategy/:doc" element={<BrandDoc />} />
                <Route path="*" element={<Page><EmptyState title="Page introuvable" /></Page>} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </AppShell>
            }
          />
        </Routes>
      </HashRouter>
    </ToastProvider>
  )
}
