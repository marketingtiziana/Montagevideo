/**
 * Reel.tsx — composition principale (jalon 8, assemblage complet).
 *
 * Assemble : facecam étalonné (recadrages fixes wide/medium/close, statiques,
 * changés uniquement aux coupes) + inserts plein écran (REMPLACENT le facecam,
 * jamais superposés) + sous-titres + audio master.
 * Règle : jamais plus d'un élément graphique à l'écran à la fois (un insert à
 * la fois ; les sous-titres suivent la couleur du plan en cours).
 * Toutes les transitions sont des coupes franches ; l'animation se joue à
 * l'intérieur de l'insert, pas sur la jointure.
 */
import { AbsoluteFill, OffthreadVideo, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Captions } from '../components/Captions.tsx';
import { Texture } from '../components/Texture.tsx';
import { EditorialType } from '../components/inserts/EditorialType.tsx';
import { NotebookList } from '../components/inserts/NotebookList.tsx';
import { CollageSubject } from '../components/inserts/CollageSubject.tsx';
import { ObjectReveal } from '../components/inserts/ObjectReveal.tsx';
import { editorial } from '../theme.ts';
import type { CaptionBlock } from '../../src/types.ts';

const SCALES = { wide: 1.0, medium: 1.12, close: 1.26 } as const;

export interface ShotSpan {
  startFrame: number;
  endFrame: number;
  kind: 'facecam' | 'insert';
  scale?: 'wide' | 'medium' | 'close';
  universe?: 'paper' | 'dark';
  template?: string;
  props?: Record<string, unknown>;
}

export interface ReelProps {
  facecam: string | null; // fichier public (facecam étalonné)
  audio?: string | null; // fichier public (audio master)
  shots: ShotSpan[];
  captions: CaptionBlock[];
}

function InsertRenderer({ span }: { span: ShotSpan }) {
  const p = span.props ?? {};
  switch (span.template) {
    case 'EditorialType':
      return <EditorialType line1={String(p.line1 ?? '')} line2={String(p.line2 ?? '')} line3={String(p.line3 ?? '')} />;
    case 'NotebookList':
      return <NotebookList columns={(p.columns as string[][]) ?? [[]]} />;
    case 'CollageSubject':
      return <CollageSubject assets={(p.assets as string[]) ?? []} />;
    case 'ObjectReveal':
      return <ObjectReveal asset={p.asset as string | undefined} />;
    default:
      return <AbsoluteFill style={{ backgroundColor: editorial.paper.bg }}><Texture opacity={editorial.paper.textureOpacity} /></AbsoluteFill>;
  }
}

export const Reel: React.FC<ReelProps> = ({ facecam, audio, shots, captions }) => {
  const frame = useCurrentFrame();

  // Recadrage facecam en cours (statique dans le plan).
  const facecamSpan = shots.find((s) => s.kind === 'facecam' && frame >= s.startFrame && frame < s.endFrame);
  const scale = SCALES[facecamSpan?.scale ?? 'wide'];

  // Surface du plan en cours (pour la couleur des sous-titres).
  const activeInsert = shots.find((s) => s.kind === 'insert' && frame >= s.startFrame && frame < s.endFrame);
  const surface: 'dark' | 'paper' = activeInsert?.universe === 'paper' ? 'paper' : 'dark';

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Facecam étalonné, recadrage statique (aucune dérive). */}
      {facecam && (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <div style={{ width: '100%', height: '100%', transform: `scale(${scale})`, transformOrigin: 'center center' }}>
            <OffthreadVideo src={staticFile(facecam)} muted />
          </div>
        </AbsoluteFill>
      )}

      {/* Inserts plein écran : remplacent le facecam pendant leur durée. */}
      {shots
        .filter((s) => s.kind === 'insert')
        .map((s, i) => (
          <Sequence key={i} from={s.startFrame} durationInFrames={s.endFrame - s.startFrame} layout="none">
            <AbsoluteFill>
              <InsertRenderer span={s} />
            </AbsoluteFill>
          </Sequence>
        ))}

      {/* Sous-titres : couleur pilotée par le plan en cours. */}
      <Captions blocks={captions} surfaceOverride={surface} />

      {/* Audio master. */}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
