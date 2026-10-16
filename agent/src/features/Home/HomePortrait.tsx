import { MCIT_DEFAULT_AVATAR, resolveMcitPersona } from '@tut/const';
import { createStaticStyles } from 'antd-style';
import { memo, useState } from 'react';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import { useResolvedHomeAgentId } from './AgentSelect/useResolvedHomeAgentId';

const styles = createStaticStyles(({ css, cssVar }) => ({
  card: css`
    position: relative;
    width: 120px;
    height: 120px;
    margin-inline-start: auto;
    margin-block-end: 2px;
    border-radius: 24px;
    overflow: hidden;
    border: 2px solid rgba(201, 162, 39, 0.45);
    background: ${cssVar.colorBgContainer};
    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.22),
      0 0 16px rgba(201, 162, 39, 0.18);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow:
        0 14px 36px rgba(0, 0, 0, 0.3),
        0 0 22px rgba(201, 162, 39, 0.3);
    }

    @media (max-width: 576px) {
      width: 88px;
      height: 88px;
      border-radius: 18px;
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
