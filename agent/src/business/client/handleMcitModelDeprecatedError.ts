import { ChatErrorType } from '@tut/types';
import { toast } from '@mcit-vendor/ui/base-ui';
import { TRPCClientError } from '@trpc/client';
import { t } from 'i18next';

interface McitModelDeprecatedErrorData {
  modelType?: string;
  requestedModel?: string;
}

export const handleMcitModelDeprecatedError = (error: unknown) => {
  if (!(error instanceof TRPCClientError) || error.message !== ChatErrorType.McitModelDeprecated)
    return;

  const requestedModel = (error.data?.errorData as McitModelDeprecatedErrorData | undefined)
    ?.requestedModel;

  toast.error(
    t('response.McitModelDeprecated', {
      model: requestedModel ?? '-',
      ns: 'error',
    }),
  );
};
