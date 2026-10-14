'use client';

import { getMcitSkillProviderById } from '@tut/const';
import { type ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useToolStore } from '@/store/tool';
import { mcitSkillStoreSelectors } from '@/store/tool/selectors';
import { McitSkillStatus } from '@/store/tool/slices/mcitSkillStore/types';

import { type DetailContextValue } from './DetailContext';
import { DetailContext } from './DetailContext';

interface McitDetailProviderProps {
  children: ReactNode;
  identifier: string;
}

export const McitDetailProvider = ({ children, identifier }: McitDetailProviderProps) => {
  const { t } = useTranslation(['setting']);

  const config = useMemo(() => getMcitSkillProviderById(identifier), [identifier]);

  const mcitSkillServers = useToolStore(mcitSkillStoreSelectors.getServers);

  const serverState = useMemo(
    () => mcitSkillServers.find((s) => s.identifier === identifier),
    [identifier, mcitSkillServers],
  );

  const isConnected = useMemo(
    () => serverState?.status === McitSkillStatus.CONNECTED,
    [serverState],
  );

  const useFetchProviderTools = useToolStore((s) => s.useFetchProviderTools);
  const providerTools = useToolStore((s) => s.mcitSkillToolsMap[identifier]);
  const { isHydrated, isValidating } = useFetchProviderTools(identifier);

  // The tool catalog is read from the store (the replica view); the hook only
  // orchestrates the fetch. `isLoading` means "nothing to show yet" — a
  // revalidation with the tools already on screen must not blank them.
  const tools = providerTools ?? [];
  const toolsLoading = !providerTools && (isValidating || !isHydrated);

  if (!config) return null;

  const { author, authorUrl, description, icon, readme, label } = config;

  const localizedDescription = t(`tools.mcitSkill.providers.${identifier}.description`, {
    defaultValue: description,
  });
  const localizedReadme = t(`tools.mcitSkill.providers.${identifier}.readme`, {
    defaultValue: readme,
  });

  const value: DetailContextValue = {
    author,
    authorUrl,
    config,
    description,
    icon,
    identifier,
    isConnected,
    label,
    localizedDescription,
    localizedReadme,
    readme,
    tools,
    toolsLoading,
  };

  return <DetailContext value={value}>{children}</DetailContext>;
};
