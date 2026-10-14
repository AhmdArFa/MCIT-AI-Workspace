'use client';

import { ModalHost } from '@mcit-vendor/ui/base-ui';
import { memo, type PropsWithChildren } from 'react';

import BusinessAuthProvider from '@/business/client/BusinessAuthProvider';
import { TutAnalyticsProviderWrapper } from '@/components/Analytics/TutAnalyticsProviderWrapper';
import { mapFeatureFlagsEnvToState } from '@/config/featureFlags';
import type { AuthSPAServerConfig } from '@/types/spaServerConfig';

import AuthContainer from './AuthContainer';
import AuthLocale from './AuthLocale';
import { AuthServerConfigProvider } from './AuthServerConfigProvider';
import AuthThemeLite from './AuthThemeLite';

const AuthShell = memo<PropsWithChildren>(({ children }) => {
  const serverConfig = window.__SERVER_CONFIG__ as unknown as AuthSPAServerConfig | undefined;
  const locale = document.documentElement.lang || 'en-US';

  return (
    <AuthLocale defaultLang={locale}>
      <AuthThemeLite globalCDN={serverConfig?.globalCDN}>
        <AuthServerConfigProvider
          enableOIDC={serverConfig?.enableOIDC}
          isMobile={false}
          serverConfig={serverConfig?.config}
          featureFlags={
            serverConfig?.featureFlags
              ? mapFeatureFlagsEnvToState(serverConfig.featureFlags)
              : undefined
          }
        >
          <TutAnalyticsProviderWrapper>
            <BusinessAuthProvider>
              <AuthContainer>{children}</AuthContainer>
            </BusinessAuthProvider>
          </TutAnalyticsProviderWrapper>
        </AuthServerConfigProvider>
        <ModalHost />
      </AuthThemeLite>
    </AuthLocale>
  );
});

AuthShell.displayName = 'AuthShell';

export default AuthShell;
