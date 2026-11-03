import type { Metadata } from 'next';
import BoardApp from '@/components/board/BoardApp';

export const metadata: Metadata = {
  title: 'C’est quoi une LLC | Fynovates',
  description: 'Board visuel : en nom propre, sans structure, face à une LLC.',
};

export default function BoardLlcPage() {
  return <BoardApp />;
}
