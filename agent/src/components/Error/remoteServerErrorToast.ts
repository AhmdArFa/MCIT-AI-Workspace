import type { RemoteServerNetworkErrorType } from '@tut/types';
import { toast } from '@mcit-vendor/ui/base-ui';
import { t } from 'i18next';

export const remoteServerErrorToast = (errorType: RemoteServerNetworkErrorType) => {
  toast.error({
    id: `remote-server-network-error-${errorType}`,
    title: t(`response.${errorType}`, { ns: 'error' }),
  });
};
