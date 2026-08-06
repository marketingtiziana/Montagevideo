/**
 * NotebookList (univers dark) — carte blanche 900x1080 centrée, coin bas droit
 * corné, lignes horizontales gris clair espacées de 42 px, séparateur vertical
 * si deux colonnes. Texte EB Garamond Bold Italic 46 px, aligné à gauche.
 * Entrée : dépliage diagonal depuis le coin haut gauche sur 22 frames, avec
 * ombre de pli, puis remplissage ligne par ligne toutes les 20 frames.
 */
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { editorial, inserts } from '../../theme.ts';
import { Texture } from '../Texture.tsx';

export interface NotebookListProps {
  columns: string[][]; // 1 ou 2 colonnes
}

export const NotebookList: React.FC<NotebookListProps> = ({ columns }) => {
  const frame = useCurrentFrame();
  const cfg = inserts.notebookList;
  const { width: W, height: H } = cfg.card;

  // Dépliage diagonal depuis le coin haut gauche.
  const unfold = interpolate(frame, [0, cfg.unfoldFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = 0.6 + 0.4 * unfold;
  const rot = interpolate(unfold, [0, 1], [-8, 0]);

  // Lignes de règle horizontales.
  const ruleCount = Math.floor(H / cfg.lineGap) - 1;
  const rules = Array.from({ length: ruleCount }, (_, i) => (i + 1) * cfg.lineGap);

  const two = columns.length > 1;

  return (
    <AbsoluteFill style={{ backgroundColor: editorial.dark.bg }}>
      <Texture opacity={editorial.dark.textureOpacity} ink="#FFFFFF" />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            width: W,
            height: H,
            backgroundColor: editorial.dark.paperCard,
            transform: `scale(${scale}) rotate(${rot}deg)`,
            transformOrigin: 'top left',
            opacity: unfold,
            boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Règles horizontales gris clair. */}
          {rules.map((y) => (
            <div key={y} style={{ position: 'absolute', left: 40, right: 40, top: y, height: 1, backgroundColor: '#DDDDDD' }} />
          ))}
          {/* Séparateur vertical si deux colonnes. */}
          {two && <div style={{ position: 'absolute', left: W / 2, top: 40, bottom: 40, width: 1, backgroundColor: '#DDDDDD' }} />}
          {/* Coin bas droit corné. */}
          <div style={{ position: 'absolute', right: 0, bottom: 0, width: 70, height: 70, background: 'linear-gradient(135deg, transparent 50%, #EDEDED 50%)', boxShadow: '-2px -2px 6px rgba(0,0,0,0.12)' }} />

          {/* Colonnes, remplissage ligne par ligne. */}
          {columns.map((col, ci) => (
            <div key={ci} style={{ position: 'absolute', top: cfg.lineGap - 8, left: (two && ci === 1 ? W / 2 : 0) + 56, width: (two ? W / 2 : W) - 96 }}>
              {col.map((line, li) => {
                const appearAt = (globalLineIndex(columns, ci, li)) * cfg.lineIntervalFrames + cfg.unfoldFrames;
                const op = interpolate(frame, [appearAt, appearAt + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                return (
                  <div
                    key={li}
                    style={{
                      height: cfg.lineGap,
                      lineHeight: `${cfg.lineGap}px`,
                      fontFamily: cfg.text.font,
                      fontWeight: cfg.text.weight,
                      fontStyle: cfg.text.style,
                      fontSize: cfg.text.size,
                      color: editorial.paper.ink,
                      opacity: op,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Index global d'une ligne (colonnes lues de gauche à droite) pour la cadence. */
function globalLineIndex(columns: string[][], ci: number, li: number): number {
  let n = 0;
  for (let c = 0; c < ci; c++) n += columns[c]!.length;
  return n + li;
}
