'use client';

import { Flexbox } from '@mcit-vendor/ui';
import { memo } from 'react';

export default memo(function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flexbox height="100%" style={{ overflow: 'auto' }} width="100%">
      {children}
    </Flexbox>
  );
});
