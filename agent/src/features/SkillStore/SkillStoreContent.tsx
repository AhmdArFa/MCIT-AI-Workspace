'use client';

import { Flexbox } from '@mcit-vendor/ui';
import { Tabs, type TabsItem } from '@mcit-vendor/ui/base-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useToolStore } from '@/store/tool';

import Search from './Search';
import AddSkillButton from './SkillList/AddSkillButton';
import McitList from './SkillList/Mcit';
import MarketSkillList from './SkillList/MarketSkills';
import MCPList from './SkillList/MCP';

export enum SkillStoreTab {
  Mcit = 'mcit',
  MCP = 'mcp',
  Skills = 'skills',
}

export const SkillStoreContent = () => {
  const { t } = useTranslation('setting');
  const [activeTab, setActiveTab] = useState<SkillStoreTab>(SkillStoreTab.Mcit);
  const [mcitKeywords, setMcitKeywords] = useState('');
  const [skillKeywords, setSkillKeywords] = useState('');

  // Refresh builtin-tool install state for the active workspace whenever the
  // modal mounts, so entries opened from contexts that don't host the chat
  // input (e.g. Home banner) don't read leftover personal-scope state.
  const useFetchUninstalledBuiltinTools = useToolStore((s) => s.useFetchUninstalledBuiltinTools);
  useFetchUninstalledBuiltinTools(true);

  const options: TabsItem[] = [
    { key: SkillStoreTab.Mcit, label: t('skillStore.tabs.mcit') },
    { key: SkillStoreTab.Skills, label: t('skillStore.tabs.skills') },
    { key: SkillStoreTab.MCP, label: t('skillStore.tabs.mcp') },
  ];

  const isMcit = activeTab === SkillStoreTab.Mcit;
  const isSkills = activeTab === SkillStoreTab.Skills;
  const isMCP = activeTab === SkillStoreTab.MCP;

  return (
    <Flexbox gap={8} style={{ maxHeight: '75vh' }} width={'100%'}>
      <Flexbox gap={8}>
        <Flexbox horizontal align={'center'} gap={8}>
          <Tabs
            activeKey={activeTab}
            items={options}
            style={{ flex: 1 }}
            styles={{
              list: { display: 'flex', width: '100%' },
              tab: { flex: 1 },
            }}
            onChange={(key) => setActiveTab(key as SkillStoreTab)}
          />
          <AddSkillButton />
        </Flexbox>
        <Search
          activeTab={activeTab}
          onMcitSearch={setMcitKeywords}
          onSkillSearch={setSkillKeywords}
        />
      </Flexbox>
      <Flexbox height={496} style={{ marginBlockEnd: -12, marginInline: -16 }}>
        <Flexbox flex={1} style={{ display: isMcit ? 'flex' : 'none', overflow: 'auto' }}>
          <McitList keywords={mcitKeywords} />
        </Flexbox>
        <Flexbox flex={1} style={{ display: isSkills ? 'flex' : 'none', overflow: 'auto' }}>
          <MarketSkillList keywords={skillKeywords} />
        </Flexbox>
        <Flexbox flex={1} style={{ display: isMCP ? 'flex' : 'none', overflow: 'auto' }}>
          <MCPList />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};
