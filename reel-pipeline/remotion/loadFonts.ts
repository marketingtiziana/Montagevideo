import { continueRender, delayRender } from 'remotion';
import { INTER_DATA_URI } from './interFontData';

/**
 * Load the bundled Inter variable font (weights 100–900) from an inline data
 * URI so captions render in real Inter Black. Using a data URI (not a fetched
 * file) means the font bytes are present synchronously in the bundle, with no
 * network/fetch race in headless rendering — the earlier staticFile approach
 * loaded too late and fell back to a system font.
 */
let started = false;

export function ensureFonts(): void {
  if (started || typeof document === 'undefined') return;
  started = true;

  const style = document.createElement('style');
  style.textContent =
    `@font-face{font-family:'Inter';` +
    `src:url('${INTER_DATA_URI}') format('truetype');` +
    `font-weight:100 900;font-style:normal;font-display:block;}`;
  document.head.appendChild(style);

  const anyDoc = document as unknown as { fonts?: { load: (f: string) => Promise<unknown> } };
  if (anyDoc.fonts) {
    const handle = delayRender('load-inter-font');
    Promise.all([
      anyDoc.fonts.load('900 84px Inter'),
      anyDoc.fonts.load('700 40px Inter'),
      anyDoc.fonts.load('400 26px Inter'),
    ])
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }
}
