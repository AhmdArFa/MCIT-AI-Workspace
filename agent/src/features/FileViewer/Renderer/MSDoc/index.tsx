'use client';

import { Center, Flexbox } from '@mcit-vendor/ui';
import { Spin } from '@mcit-vendor/ui/base-ui';
import { lazy, memo, Suspense } from 'react';

import AsyncError from '@/components/AsyncError';

import { useBlobFileLoader } from '../../hooks/useBlobFileLoader';
import NotSupport from '../../NotSupport';
import OfficeOnlinePane from '../Document/OfficeOnlinePane';

// Deferred: pulls in react-pdf and the office renderers.
const DocumentPreview = lazy(() => import('../Document'));

const OFFICE_MIME_TYPES: Record<string, string> = {
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odt: 'application/vnd.oasis.opendocument.text',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const OFFICE_MIME_VALUES = new Set(Object.values(OFFICE_MIME_TYPES));

// `fileType` is either a bare extension or a full MIME depending on how the file
// was uploaded; the renderer map keys on MIME, so normalize both to a MIME.
export const resolveContentType = (fileType?: string, fileName?: string): string => {
  const lowerFileType = fileType?.toLowerCase();
  if (lowerFileType) {
    if (OFFICE_MIME_VALUES.has(lowerFileType)) return lowerFileType;
    if (OFFICE_MIME_TYPES[lowerFileType]) return OFFICE_MIME_TYPES[lowerFileType];
  }

  const extension = fileName?.toLowerCase().split('.').at(-1);
  return (extension && OFFICE_MIME_TYPES[extension]) || 'application/octet-stream';
};

interface MSDocViewerProps {
  fileId: string;
  fileName?: string;
  fileType?: string;
  url: string | null;
}

const MSDocViewer = memo<MSDocViewerProps>(({ fileId, fileName, fileType, url }) => {
  return <OfficeOnlinePane fileId={fileId} fileName={fileName} url={url ?? undefined} />;
});

MSDocViewer.displayName = 'MSDocViewer';

export default MSDocViewer;
