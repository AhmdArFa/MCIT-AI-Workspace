import type { ISlashMenuOption } from '@mcit-vendor/editor';
import type { ReactNode } from 'react';

export type MentionCategoryId =
  | 'agent'
  | 'agent-private'
  | 'agent-workspace'
  | 'topic'
  | 'member'
  | 'skill'
  | 'tool'
  | 'localFile';

export interface MentionCategory {
  icon: ReactNode;
  id: MentionCategoryId;
  items: ISlashMenuOption[];
  label: string;
}
