'use client';

import { useEditor } from '@mcit-vendor/editor/react';
import { memo } from 'react';

import { EditorCanvas as SharedEditorCanvas } from '@/features/EditorCanvas';

import { useResolvedDocumentId } from './documentViewContext';

const EditorCanvas = memo(() => {
  const editor = useEditor();

  const documentId = useResolvedDocumentId();

  return <SharedEditorCanvas documentId={documentId} editor={editor} sourceType="notebook" />;
});

export default EditorCanvas;
