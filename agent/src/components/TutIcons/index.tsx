import type {
  ModelIcon as TutModelIcon,
  ModelTag as TutModelTag,
  ProviderCombine as TutProviderCombine,
  ProviderIcon as TutProviderIcon,
} from '@mcit-vendor/icons';
import { Skeleton } from '@mcit-vendor/ui/base-ui';
import type { ComponentProps } from 'react';
import { lazy, Suspense } from 'react';

// The catalog-backed features of @mcit-vendor/icons statically import every brand
// icon (~3 MB). Mounting them through lazy() keeps that catalog in one shared
// chunk that loads after paint instead of inside each route's closure.
const LazyModelIcon = lazy(() => import('@mcit-vendor/icons/es/features/ModelIcon'));
const LazyModelTag = lazy(() => import('@mcit-vendor/icons/es/features/ModelTag'));
const LazyProviderIcon = lazy(() =>
  import('@/libs/providerIcon').then(({ ProviderIcon }) => ({ default: ProviderIcon })),
);
const LazyProviderCombine = lazy(() =>
  import('@/libs/providerIcon').then(({ ProviderCombine }) => ({ default: ProviderCombine })),
);

const DEFAULT_SIZE = 24;

export const ModelIcon = (props: ComponentProps<typeof TutModelIcon>) => {
  const size = props.size ?? DEFAULT_SIZE;
  return (
    <Suspense fallback={<Skeleton height={size} width={size} />}>
      <LazyModelIcon {...props} />
    </Suspense>
  );
};

export const ProviderIcon = (props: ComponentProps<typeof TutProviderIcon>) => {
  const size = props.size ?? DEFAULT_SIZE;
  return (
    <Suspense fallback={<Skeleton height={size} width={size} />}>
      <LazyProviderIcon {...props} />
    </Suspense>
  );
};

export const ModelTag = (props: ComponentProps<typeof TutModelTag>) => (
  <Suspense fallback={<Skeleton height={22} width={96} />}>
    <LazyModelTag {...props} />
  </Suspense>
);

export const ProviderCombine = (props: ComponentProps<typeof TutProviderCombine>) => {
  const size = props.size ?? DEFAULT_SIZE;
  return (
    <Suspense fallback={<Skeleton height={size} width={size * 4} />}>
      <LazyProviderCombine {...props} />
    </Suspense>
  );
};
