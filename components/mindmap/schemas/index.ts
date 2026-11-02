import type { ComponentType } from 'react';
import type { SchemaKind } from '@/data/types';
import Orgchart from './Orgchart';
import Moneyflow from './Moneyflow';
import Timeline from './Timeline';
import Calendar from './Calendar';
import Passthrough from './Passthrough';

export interface SchemaProps {
  /** Couleur d'accent du cluster. */
  accent: string;
  /** Teinte claire du cluster. */
  soft: string;
  /** Couleur de texte foncée du cluster (contraste AA). */
  ink: string;
  /** Graine pour les tracés roughjs. */
  seed: string;
}

export const SCHEMAS: Record<SchemaKind, ComponentType<SchemaProps>> = {
  orgchart: Orgchart,
  moneyflow: Moneyflow,
  timeline: Timeline,
  calendar: Calendar,
  passthrough: Passthrough,
};
