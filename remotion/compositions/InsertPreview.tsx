/**
 * InsertPreview.tsx — jalons 6–7. Prévisualise un template d'insert plein écran
 * (jamais superposé au facecam), pour valider les deux univers graphiques.
 */
import { AbsoluteFill } from 'remotion';
import { EditorialType } from '../components/inserts/EditorialType.tsx';
import { NotebookList } from '../components/inserts/NotebookList.tsx';
import { CollageSubject } from '../components/inserts/CollageSubject.tsx';

export interface InsertPreviewProps {
  template: 'EditorialType' | 'NotebookList' | 'CollageSubject';
  editorialType?: { line1: string; line2: string; line3: string };
  notebookList?: { columns: string[][] };
  collageSubject?: { assets: string[] };
}

export const InsertPreview: React.FC<InsertPreviewProps> = ({
  template,
  editorialType,
  notebookList,
  collageSubject,
}) => {
  return (
    <AbsoluteFill>
      {template === 'EditorialType' && editorialType && <EditorialType {...editorialType} />}
      {template === 'NotebookList' && notebookList && <NotebookList {...notebookList} />}
      {template === 'CollageSubject' && collageSubject && <CollageSubject {...collageSubject} />}
    </AbsoluteFill>
  );
};
