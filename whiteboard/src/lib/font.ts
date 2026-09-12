import {continueRender, delayRender, staticFile} from 'remotion';

/**
 * Caveat (Google Fonts, OFL) est embarquee dans public/fonts pour ne
 * dependre d'aucun reseau au moment du rendu.
 */
let started = false;

export const loadCaveat = () => {
  if (started || typeof window === 'undefined') return;
  started = true;
  const handle = delayRender('Chargement de la police Caveat');
  const face = new FontFace(
    'Caveat',
    `url(${staticFile('fonts/Caveat.ttf')}) format('truetype')`,
    {weight: '400 700', style: 'normal'}
  );
  face
    .load()
    .then((loaded) => {
      document.fonts.add(loaded);
      return document.fonts.ready;
    })
    .then(() => continueRender(handle))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Caveat introuvable, repli sur la police systeme', err);
      continueRender(handle);
    });
};
