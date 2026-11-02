import type { ComponentType } from 'react';
import type { SchemaKind } from '@/data/types';
import Placeholder from './Placeholder';

export interface SchemaProps {
  /** Couleur d'accent du cluster. */
  accent: string;
  /** Teinte claire du cluster. */
  soft: string;
  /** Graine pour les tracés roughjs. */
  seed: string;
}

export const SCHEMAS: Record<SchemaKind, ComponentType<SchemaProps>> = {
  orgchart: Placeholder,
  moneyflow: Placeholder,
  timeline: Placeholder,
  calendar: Placeholder,
  passthrough: Placeholder,
};
