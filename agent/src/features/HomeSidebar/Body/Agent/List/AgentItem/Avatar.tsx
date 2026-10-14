import { DEFAULT_AVATAR } from '@tut/const';
import { memo } from 'react';

import Avatar from '@/components/Avatar';

interface AgentAvatarProps {
  avatar?: string;
  avatarBackground?: string;
  title?: string;
}

const AgentAvatar = memo<AgentAvatarProps>(({ avatar, avatarBackground, title }) => {
  return (
    <Avatar
      emojiScaleWithBackground
      avatar={avatar || DEFAULT_AVATAR}
      background={avatarBackground}
      name={title}
      responsive
      shape={'square'}
      size={36}
    />
  );
});

export default AgentAvatar;
