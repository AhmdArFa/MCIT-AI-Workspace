import { type SharedDocumentData } from '@tut/types';
import { type ReactNode } from 'react';

interface PublishedShellProps {
  children: ReactNode;
  data?: SharedDocumentData;
}

export default function PublishedShell({ children }: PublishedShellProps) {
  return <>{children}</>;
}
