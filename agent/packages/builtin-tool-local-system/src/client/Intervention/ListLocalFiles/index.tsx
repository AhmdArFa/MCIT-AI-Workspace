import type { ListLocalFileParams } from '@tut/electron-client-ipc';
import type { BuiltinInterventionProps } from '@tut/types';
import { Flexbox } from '@mcit-vendor/ui';
import { memo } from 'react';

import { LocalFolder } from '@/features/LocalFile';

import OutOfScopeWarning from '../OutOfScopeWarning';

const ListLocalFiles = memo<BuiltinInterventionProps<ListLocalFileParams>>(({ args }) => {
  const { path } = args;

  return (
    <Flexbox gap={12}>
      <OutOfScopeWarning paths={[path]} />
      <LocalFolder path={path} />
    </Flexbox>
  );
});

ListLocalFiles.displayName = 'ListLocalFilesIntervention';

export default ListLocalFiles;
