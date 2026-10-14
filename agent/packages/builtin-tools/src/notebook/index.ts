import { type BuiltinRender } from '@tut/types';

import CreateDocumentRender from './CreateDocumentRender';

export const NotebookIdentifier = 'tut-notebook';

export const NotebookApiName = {
  createDocument: 'createDocument',
} as const;

export const NotebookRenders: Record<string, BuiltinRender> = {
  [NotebookApiName.createDocument]: CreateDocumentRender as BuiltinRender,
};
