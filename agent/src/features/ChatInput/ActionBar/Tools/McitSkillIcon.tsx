import { type McitSkillProviderType } from '@tut/const';
import { Icon } from '@mcit-vendor/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';

export const SKILL_ICON_SIZE = 24;

/**
 * MCIT AI Skill Provider icon component
 */
const McitSkillIcon = memo<Pick<McitSkillProviderType, 'icon' | 'label'> & { size: number }>(
  ({ icon, label, size = SKILL_ICON_SIZE }) => {
    if (typeof icon === 'string') {
      return (
        <img
          alt={label}
          src={icon}
          style={{ maxHeight: size, maxWidth: size, objectFit: 'contain' }}
        />
      );
    }

    return <Icon fill={cssVar.colorText} icon={icon} size={size} />;
  },
);

McitSkillIcon.displayName = 'McitSkillIcon';

export default McitSkillIcon;
