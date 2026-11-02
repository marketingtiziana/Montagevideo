import type { Metadata } from 'next';
import MindmapApp from '@/components/mindmap/MindmapApp';

export const metadata: Metadata = {
  title: 'Comment fonctionne une LLC | Fynovates',
  description:
    'Mindmap interactive : le fonctionnement d’une LLC américaine, le rôle de chaque acteur, les documents, les obligations et les pièges à éviter.',
};

export default function MindmapLlcPage() {
  return <MindmapApp />;
}
