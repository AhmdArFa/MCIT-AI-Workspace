import { Flexbox } from '@mcit-vendor/ui';
import { memo } from 'react';

import { type ChatFileItem } from '@/types/index';

import FileItem from './Item';

interface FileListViewerProps {
  items: ChatFileItem[];
}

const FileListViewer = memo<FileListViewerProps>(({ items }) => {
  return (
    <Flexbox gap={8}>
      {items.map((item) => (
        <FileItem key={item.id} {...item} />
      ))}
    </Flexbox>
  );
});
export default FileListViewer;
