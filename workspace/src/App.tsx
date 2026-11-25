import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell, Page } from './components/AppShell'
import { Button, EmptyState, Loading, ToastProvider } from './components/ui'
import { seedIfEmpty } from './lib/seed'
import ArtDirection from './views/ArtDirection'
import Board from './views/Board'
import Brands from './views/Brands'
import Channel from './views/Channel'
import Database from './views/Database'
import Insights from './views/Insights'
import { Library, References } from './views/Library'
import Matrix from './views/Matrix'
import ModelGallery from './views/ModelGallery'
import Overview from './views/Overview'
import Pillars from './views/Pillars'
import Stories from './views/Stories'

const MindMap = lazy(() => import('./views/MindMap'))
const Journeys = lazy(() => import('./views/Journeys'))

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
            title="Cette vue a rencontré une erreur"
            description={this.state.error.message}
            action={<Button onClick={() => this.setState({ error: null })}>Réessayer</Button>}
          />
        </Page>
      )
    return this.props.children
  }
}

function Boot({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'ready' | Error>('loading')
  useEffect(() => {
    seedIfEmpty()
      .then(() => setState('ready'))
      .catch((e) => setState(e instanceof Error ? e : new Error(String(e))))
  }, [])
  if (state === 'loading') return <Loading />
  if (state instanceof Error)
    return (
      <Page>
        <EmptyState
          title="Impossible d’ouvrir la base locale"
          description={`${state.message}. Le stockage du navigateur est peut-être désactivé (navigation privée).`}
        />
      </Page>
    )
  return <>{children}</>
}

export default function App() {
  return (
    <ToastProvider>
      <Boot>
        <HashRouter>
          <AppShell>
            <ErrorBoundary>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/map" element={<MindMap />} />
                  <Route path="/brands" element={<Brands />} />
                  <Route path="/pillars" element={<Pillars />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/channel/:id" element={<Channel />} />
                  <Route path="/art-direction" element={<ArtDirection />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/references" element={<References />} />
                  <Route path="/infographics" element={<ModelGallery model="infographic" />} />
                  <Route path="/carousels" element={<ModelGallery model="carousel" />} />
                  <Route path="/storyboards" element={<ModelGallery model="storyboard" />} />
                  <Route path="/database" element={<Database />} />
                  <Route path="/board" element={<Board />} />
                  <Route path="/stories" element={<Stories />} />
                  <Route path="/matrix" element={<Matrix />} />
                  <Route path="/journeys" element={<Journeys />} />
                  <Route path="*" element={<Page><EmptyState title="Page introuvable" /></Page>} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </AppShell>
        </HashRouter>
      </Boot>
    </ToastProvider>
  )
}
