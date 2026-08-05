/**
 * NotebookList (univers dark) — carte blanche 900x1080 centrée, coin bas droit
 * corné, lignes horizontales gris clair espacées de 42 px, séparateur vertical
 * si deux colonnes. Texte EB Garamond Bold Italic 46 px, aligné à gauche.
 * Entrée : dépliage diagonal depuis le coin haut gauche sur 22 frames, avec
 * ombre de pli, puis remplissage ligne par ligne toutes les 20 frames.
 *
 * JALON 1 : stub (construit au jalon 7).
 */
import { AbsoluteFill } from 'remotion';
import { editorial, inserts } from '../../theme.ts';
import { Texture } from '../Texture.tsx';

export interface NotebookListProps {
  columns: string[][]; // 1 ou 2 colonnes
}

export const NotebookList: React.FC<NotebookListProps> = () => {
  void inserts.notebookList;
  return (
    <AbsoluteFill style={{ backgroundColor: editorial.dark.bg }}>
      <Texture opacity={editorial.dark.textureOpacity} ink="#FFFFFF" />
    </AbsoluteFill>
  );
};
