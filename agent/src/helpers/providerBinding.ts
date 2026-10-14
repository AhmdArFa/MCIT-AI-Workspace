import type { HeterogeneousProviderBindingError } from '@tut/heterogeneous-agents';

interface ResolveProviderBindingGuardInput {
  active: boolean;
  error?: HeterogeneousProviderBindingError;
  isReady: boolean;
}

export const resolveProviderBindingGuard = ({
  active,
  error,
  isReady,
}: ResolveProviderBindingGuardInput) => ({
  blocked: active && (!isReady || !!error),
  error: active && isReady ? error : undefined,
});
