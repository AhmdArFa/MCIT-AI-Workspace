import { AsyncTaskStatus } from '@tut/types';

interface ResolveGenerationDisplayStateParams {
  generationStatus?: AsyncTaskStatus;
  isLoading: boolean;
  statusRequestError?: unknown;
}

export const resolveGenerationDisplayState = ({
  generationStatus,
  isLoading,
  statusRequestError,
}: ResolveGenerationDisplayStateParams) => ({
  status: generationStatus ?? (isLoading ? AsyncTaskStatus.Processing : AsyncTaskStatus.Pending),
  statusCheckFailed: Boolean(statusRequestError),
});
