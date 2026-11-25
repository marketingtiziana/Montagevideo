import '@fontsource-variable/inter'
import '@fontsource/instrument-serif'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { applyTheme } from './components/AppShell'
import './index.css'

try {
  applyTheme(localStorage.getItem('theme') ?? 'system')
} catch {
  /* storage unavailable */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
