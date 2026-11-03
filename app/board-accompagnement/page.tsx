import type { Metadata } from 'next';
import BoardApp from '@/components/board/BoardApp';

export const metadata: Metadata = {
  title: 'Accompagné dans la durée | Fynovates',
  description: 'Board visuel : seul après la signature, face à un accompagnement dans la durée.',
};

export default function BoardAccompagnementPage() {
  return <BoardApp boardId="accompagnement" />;
}
