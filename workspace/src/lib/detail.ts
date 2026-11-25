import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export type DetailKind = 'c' | 'p' | 'i' | 'l'

/** Detail panels are addressed by URL (?c=FN-001, ?p=PB-A01, ?i=IMG-001) so they are linkable. */
export function useDetail() {
  const [params, setParams] = useSearchParams()
  const open = useCallback(
    (kind: DetailKind, id: string, tab?: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          ;(['c', 'p', 'i', 'l', 't'] as string[]).forEach((k) => next.delete(k))
          next.set(kind, id)
          if (tab) next.set('t', tab)
          return next
        },
        { replace: false },
      )
    },
    [setParams],
  )
  const close = useCallback(() => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      ;(['c', 'p', 'i', 'l', 't'] as string[]).forEach((k) => next.delete(k))
      return next
    })
  }, [setParams])
  return {
    contentId: params.get('c'),
    problemId: params.get('p'),
    imageId: params.get('i'),
    longformId: params.get('l'),
    tab: params.get('t'),
    open,
    close,
  }
}
