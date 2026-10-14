'use client';

import { Flexbox } from '@mcit-vendor/ui';
import { Skeleton as TutSkeleton } from '@mcit-vendor/ui/base-ui';
import { memo } from 'react';

interface SkeletonProps {
  count?: number;
}

const Skeleton = memo<SkeletonProps>(({ count = 3 }) => {
  return (
    <Flexbox gap={8}>
      {Array.from({ length: count }).map((_, index) => (
        <TutSkeleton height={68} key={index} />
      ))}
    </Flexbox>
  );
});

export default Skeleton;
