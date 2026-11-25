import { useRef, useState } from 'react'
import { exportWorkspace, importWorkspace, resetWorkspace } from '../lib/actions'
import { Button, Confirm, Dialog, Field, Select, useToast } from './ui'

function getTheme() {
  try {
    return localStorage.getItem('theme') ?? 'system'
  } catch {
    return 'system'
  }
}
export function applyTheme(t: string) {
  if (t === 'system') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', t)
}

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [theme, setTheme] = useState(getTheme())

  const doExport = async () => {
    const blob = await exportWorkspace()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `fynovates-workspace-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    toast('Sauvegarde exportée')
  }
  const doImport = async (f: File | undefined) => {
    if (!f) return
    try {
      await importWorkspace(f)
      toast('Sauvegarde restaurée')
      onClose()
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Import impossible', 'error')
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} title="Données & sauvegarde">
        <div className="space-y-5 text-[13px]">
          <p className="text-ink-2">
            Toutes les données (contenus, problématiques, images importées, positions de la mind map) sont enregistrées
            automatiquement dans ce navigateur (IndexedDB) et persistent après actualisation. Pour partager ou sauvegarder,
            exporte un fichier JSON.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={doExport}>
              Exporter (.json)
            </Button>
            <Button onClick={() => fileRef.current?.click()}>Importer une sauvegarde</Button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => doImport(e.target.files?.[0])} />
          </div>
          <Field label="Thème">
            <Select
              value={theme}
              onChange={(v) => {
                const t = v ?? 'system'
                setTheme(t)
                try {
                  localStorage.setItem('theme', t)
                } catch {
                  /* storage unavailable */
                }
                applyTheme(t)
              }}
              options={[
                { value: 'system', label: 'Système' },
                { value: 'light', label: 'Clair' },
                { value: 'dark', label: 'Sombre' },
              ]}
            />
          </Field>
          <div className="border-t border-line pt-4">
            <div className="mb-2 font-medium">Réinitialiser</div>
            <p className="mb-3 text-ink-3">Remet les données d’origine. Les modifications et images importées seront perdues.</p>
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              Réinitialiser l’espace de travail
            </Button>
          </div>
        </div>
      </Dialog>
      <Confirm
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Réinitialiser l’espace de travail ?"
        message="Toutes les modifications et les images importées seront supprimées. Pense à exporter une sauvegarde avant."
        confirmLabel="Réinitialiser"
        onConfirm={async () => {
          await resetWorkspace()
          toast('Espace réinitialisé')
          onClose()
        }}
      />
    </>
  )
}
