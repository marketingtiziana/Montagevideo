import type { Metadata } from 'next';
import BoardApp from '@/components/board/BoardApp';

export const metadata: Metadata = {
  title: 'Peur qu’on me tombe dessus | Fynovates',
  description: 'Board visuel : aujourd’hui dans le flou, face à une situation clarifiée.',
};

export default function BoardPeurPage() {
  return <BoardApp boardId="peur" />;
}
