import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_FAMILY, THEME} from '../theme';
import {Highlighter} from './Highlighter';
import {FloatingPencil} from './Pencil';

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export type HandwritingProps = {
  /** une seule ligne de texte */
  text: string;
  /** frame (relative a la scene) ou l'ecriture demarre */
  start: number;
  fontSize: number;
  /** vitesse d'ecriture : 50 a 70 ms par lettre */
  msPerChar?: number;
  color?: string;
  seed?: number;
  /** sous-chaine a surligner au stabilo jaune */
  highlight?: string;
  /** frames apres la fin de l'ecriture avant le coup de stabilo */
  highlightDelay?: number;
  highlightDuration?: number;
  /** main au crayon qui suit l'ecriture */
  pencil?: boolean;
  /** inclinaison max d'un mot, en degres */
  wobble?: number;
  style?: React.CSSProperties;
};

type Part = {text: string; highlighted: boolean};

const splitHighlight = (text: string, highlight?: string): Part[] => {
  if (!highlight) return [{text, highlighted: false}];
  const i = text.indexOf(highlight);
  if (i < 0) return [{text, highlighted: false}];
  const out: Part[] = [];
  if (i > 0) out.push({text: text.slice(0, i), highlighted: false});
  out.push({text: highlight, highlighted: true});
  const rest = text.slice(i + highlight.length);
  if (rest) out.push({text: rest, highlighted: false});
  return out;
};

/** Nombre de frames necessaires pour ecrire une ligne. */
export const writeDuration = (text: string, fps: number, msPerChar = 58) =>
  Math.ceil((text.length * msPerChar * fps) / 1000);

export const Handwriting: React.FC<HandwritingProps> = ({
  text,
  start,
  fontSize,
  msPerChar = 58,
  color = THEME.ink,
  seed = 1,
  highlight,
  highlightDelay = 5,
  highlightDuration = 11,
  pencil = false,
  wobble = 2,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const perChar = (msPerChar * fps) / 1000;
  const elapsed = frame - start;

  if (elapsed < 0) return null;

  const active = Math.floor(elapsed / perChar);
  const writing = active < text.length;

  const pencilSize = Math.max(0.42, Math.min(1, fontSize / 210));
  const total = writeDuration(text, fps, msPerChar);
  const hlProgress = highlight
    ? Math.max(0, Math.min(1, (elapsed - total - highlightDelay) / highlightDuration))
    : 0;

  let index = 0;
  let wordCounter = 0;

  const renderWords = (chunk: string) =>
    chunk.split(/(\s+)/).map((token) => {
      if (token.length === 0) return null;
      if (/^\s+$/.test(token)) {
        const key = `s${index}`;
        const first = index;
        index += token.length;
        const onSpace = pencil && writing && active >= first && active < index;
        return (
          <span key={key} style={{whiteSpace: 'pre', position: 'relative'}}>
            {token}
            {onSpace ? (
              <span style={{position: 'absolute', left: 0, top: `${fontSize * 0.62}px`, width: 0, height: 0}}>
                <FloatingPencil size={pencilSize} />
              </span>
            ) : null}
          </span>
        );
      }
      const wi = wordCounter++;
      const rot = (hash(seed * 13 + wi) * 2 - 1) * wobble;
      const dy = (hash(seed * 29 + wi) * 2 - 1) * fontSize * 0.018;
      const chars = Array.from(token);
      const node = (
        <span
          key={`w${index}`}
          style={{
            display: 'inline-block',
            transform: `rotate(${rot.toFixed(2)}deg) translateY(${dy.toFixed(2)}px)`,
            whiteSpace: 'pre',
          }}
        >
          {chars.map((ch) => {
            const i = index++;
            const p = Math.max(0, Math.min(1, (elapsed - i * perChar) / perChar));
            if (p <= 0) {
              return (
                <span key={i} style={{display: 'inline-block', opacity: 0}}>
                  {ch}
                </span>
              );
            }
            // Le masque d'ecriture est sur un span interne : sinon il
            // rognerait aussi la main au crayon.
            return (
              <span key={i} style={{display: 'inline-block', position: 'relative'}}>
                <span
                  style={{
                    display: 'inline-block',
                    clipPath: p >= 1 ? undefined : `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0)`,
                  }}
                >
                  {ch}
                </span>
                {pencil && writing && i === active ? (
                  <span
                    style={{
                      position: 'absolute',
                      left: `${p * 100}%`,
                      top: `${fontSize * 0.6}px`,
                      width: 0,
                      height: 0,
                    }}
                  >
                    <FloatingPencil size={pencilSize} />
                  </span>
                ) : null}
              </span>
            );
          })}
        </span>
      );
      return node;
    });

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY,
        fontSize,
        fontWeight: 700,
        fontVariationSettings: "'wght' 700",
        color,
        lineHeight: 1.24,
        letterSpacing: fontSize * 0.005,
        ...style,
      }}
    >
      {splitHighlight(text, highlight).map((part, pi) =>
        part.highlighted ? (
          <Highlighter
            key={pi}
            progress={hlProgress}
            thickness={fontSize * 0.5}
            seed={seed * 7 + pi}
          >
            {renderWords(part.text)}
          </Highlighter>
        ) : (
          <span key={pi}>{renderWords(part.text)}</span>
        )
      )}
    </div>
  );
};
