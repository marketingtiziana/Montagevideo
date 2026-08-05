import { staticFile, delayRender, continueRender } from 'remotion';

/**
 * Load the bundled Inter variable font (weights 100–900) before rendering, so
 * captions render in real Inter Black instead of a system fallback. The font
 * file is staged into the render's public dir by step 08; here we inject a
 * @font-face and block the render until the browser reports it loaded.
 */
let started = false;

export function ensureFonts(): void {
  if (started || typeof document === 'undefined') return;
  started = true;

  const handle = delayRender('load-inter-font');
  const style = document.createElement('style');
  style.textContent =
    `@font-face{font-family:'Inter';` +
    `src:url('${staticFile('Inter.ttf')}') format('truetype');` +
    `font-weight:100 900;font-style:normal;font-display:block;}`;
  document.head.appendChild(style);

  const anyDoc = document as unknown as { fonts?: { load: (f: string) => Promise<unknown> } };
  const loads = anyDoc.fonts
    ? Promise.all([
        anyDoc.fonts.load('900 84px Inter'),
        anyDoc.fonts.load('700 40px Inter'),
        anyDoc.fonts.load('400 26px Inter'),
      ])
    : Promise.resolve();
  loads.then(() => continueRender(handle)).catch(() => continueRender(handle));
}
