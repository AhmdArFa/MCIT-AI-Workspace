import { MCIT_DEFAULT_AVATAR, resolveMcitPersona } from '@tut/const';
import { createStaticStyles } from 'antd-style';
import { memo, useState } from 'react';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import { useResolvedHomeAgentId } from './AgentSelect/useResolvedHomeAgentId';

const styles = createStaticStyles(({ css, cssVar }) => ({
  card: css`
    position: relative;
    width: auto;
    height: 195px;
    max-width: 220px;
    margin-inline-start: auto;
    margin-block-end: -28px;
    transform: translateY(22px);
    border-radius: 0;
    overflow: visible;
    border: none;
    background: transparent;
    box-shadow: none;
    filter: drop-shadow(0 14px 24px rgba(0, 0, 0, 0.65)) drop-shadow(0 4px 10px rgba(247, 239, 138, 0.25));
    transition:
      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
      filter 0.3s ease;
    pointer-events: auto;

    &:hover {
      transform: translateY(18px) scale(1.04);
      filter: drop-shadow(0 20px 32px rgba(0, 0, 0, 0.75)) drop-shadow(0 8px 18px rgba(247, 239, 138, 0.38));
    }

    @media (max-width: 576px) {
      height: 110px;
      max-width: 120px;
    }
  `,
  image: css`
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 10%;
    pointer-events: none;
    user-select: none;
  `,
  root: css`
    position: relative;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
  `,
}));

const HomePortrait = memo(() => {
  const { agentId } = useResolvedHomeAgentId();
  const useFetchAgentConfig = useAgentStore((s) => s.useFetchAgentConfig);
  useFetchAgentConfig(true, agentId ?? '');

  const meta = useAgentStore(agentSelectors.getAgentMetaById(agentId ?? ''));
  const persona = resolveMcitPersona(meta?.avatar || meta?.name);
  const heroSrc = meta?.avatar || persona.src || MCIT_DEFAULT_AVATAR;

  const [currentSrc, setCurrentSrc] = useState(heroSrc);

  if (currentSrc !== heroSrc && heroSrc) {
    setCurrentSrc(heroSrc);
  }

  const handleImageError = () => {
    if (currentSrc !== MCIT_DEFAULT_AVATAR) {
      setCurrentSrc(MCIT_DEFAULT_AVATAR);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.card} title={`${persona.label} — ${persona.title}`}>
        <img
          alt={persona.label || meta?.title || 'Agent Avatar'}
          className={styles.image}
          key={currentSrc}
          src={currentSrc}
          onError={handleImageError}
        />
      </div>
    </div>
  );
});

export default HomePortrait;
