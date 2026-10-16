import { resolveMcitPersona } from '@tut/const';
import { createStaticStyles } from 'antd-style';
import type { ReactNode } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useHomeDailyBrief } from '@/hooks/useHomeDailyBrief';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import { useResolvedHomeAgentId } from '../AgentSelect/useResolvedHomeAgentId';
import GreetingLine from '../GreetingLine';
import { parseGreetingLine } from '../welcomeText';

const styles = createStaticStyles(({ css, cssVar }) => ({
  // Prose, not a row of chips: a flex container would make the brief's entity
  // links their own flex items and break the sentence into side-by-side columns.
  bubble: css`
    overflow: hidden;
    display: block;

    max-width: 480px;
    padding-block: 8px;
    padding-inline: 14px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 16px;

    font-size: 13.5px;
    line-height: 1.5;
    color: ${cssVar.colorText};

    background: ${cssVar.colorBgContainer};
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  `,
  /**
   * Match the action row when a brief replaces an announcement. Limit
   * prose to three lines so character greetings read comfortably without truncation.
   */
  line: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;

    min-height: 24px;
  `,
}));

interface PortraitBubbleProps {
  promo?: ReactNode;
}

const PortraitBubble = memo<PortraitBubbleProps>(({ promo }) => {
  const { t } = useTranslation('home');
  const { currentPair } = useHomeDailyBrief();
  const { agentId } = useResolvedHomeAgentId();
  const meta = useAgentStore(agentSelectors.getAgentMetaById(agentId ?? ''));
  const persona = resolveMcitPersona(meta?.avatar || meta?.name);

  const welcomeText =
    meta?.openingMessage?.trim() || persona.welcome || t('dashboard.greeting.subtitle');

  return (
    <div className={styles.bubble}>
      {promo ?? (
        <div className={styles.line}>
          {welcomeText}
        </div>
      )}
    </div>
  );
});

export default PortraitBubble;
