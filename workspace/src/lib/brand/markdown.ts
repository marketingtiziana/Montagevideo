import DOMPurify from 'dompurify'
import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: false })

/** Renders playbook Markdown to sanitized HTML. "> À VALIDER :" blockquotes get a dedicated class. */
export function renderMarkdown(md: string): string {
  const html = marked.parse(md, { async: false }) as string
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
  return clean.replace(/<blockquote>\s*<p>À VALIDER\s*:/g, '<blockquote class="to-validate"><p><b>À VALIDER :</b>')
}

/** Extracts the "> À VALIDER :" lines of a section, in order. */
export function validationItems(md: string): string[] {
  return [...md.matchAll(/^> À VALIDER\s*:\s*(.*)$/gm)].map((m) => m[1].trim())
}

export function plainText(md: string) {
  return md
    .replace(/[#>*_`|]/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}
