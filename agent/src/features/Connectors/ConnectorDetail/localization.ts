import { type TFunction } from 'i18next';

interface LocalizableConnector {
  identifier: string;
  metadata?: Record<string, unknown> | null;
  name: string;
  sourceType: string;
}

interface LocalizableProvider {
  description?: string;
  label: string;
}

interface GetLocalizedConnectorDetailOptions {
  composioApp?: LocalizableProvider;
  connector: LocalizableConnector;
  mcitProvider?: LocalizableProvider;
  t: TFunction<'setting'>;
}

export const getLocalizedConnectorDetail = ({
  composioApp,
  connector,
  mcitProvider,
  t,
}: GetLocalizedConnectorDetailOptions) => {
  const rawDescription =
    typeof connector.metadata?.description === 'string'
      ? connector.metadata.description
      : undefined;

  if (connector.sourceType === 'builtin') {
    return {
      description: t(`tools.builtins.${connector.identifier}.description`, {
        defaultValue: rawDescription || '',
      }),
      name: t(`tools.builtins.${connector.identifier}.title`, {
        defaultValue: connector.name,
      }),
    };
  }

  if (mcitProvider) {
    return {
      description: t(`tools.mcitSkill.providers.${connector.identifier}.description`, {
        defaultValue: mcitProvider.description || rawDescription || '',
      }),
      name: mcitProvider.label,
    };
  }

  if (composioApp) {
    return {
      description: t(`tools.composio.servers.${connector.identifier}.description`, {
        defaultValue: composioApp.description || rawDescription || '',
      }),
      name: composioApp.label,
    };
  }

  return {
    description: rawDescription,
    name: connector.name,
  };
};
