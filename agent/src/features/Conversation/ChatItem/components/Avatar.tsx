import { agentDisplayName } from '@tut/types';
import { type CSSProperties, type MouseEventHandler } from 'react';
import { memo } from 'react';

import A from '@/components/Avatar';
import { DEFAULT_AVATAR } from '@/const/meta';

import { type ChatItemProps } from '../type';

export interface AvatarProps {
  alt?: string;
  avatar: ChatItemProps['avatar'];
  loading?: boolean;
  onClick?: ChatItemProps['onAvatarClick'] | MouseEventHandler<HTMLDivElement>;
  size?: number;
  style?: CSSProperties;
  unoptimized?: boolean;
}

const Avatar = memo<AvatarProps>(
  ({ loading, avatar, unoptimized, onClick, size = 44, style, alt }) => {
    const displayName = agentDisplayName(avatar);

    return (
      <A
        alt={alt || displayName}
        animation={loading}
        avatar={avatar.avatar || DEFAULT_AVATAR}
        background={avatar.backgroundColor}
        name={displayName}
        responsive
        shape={'square'}
        size={size}
        style={{ borderRadius: 10, overflow: 'hidden', ...style }}
        title={displayName}
        unoptimized={unoptimized}
        onClick={onClick}
      />
    );
  },
);

export default Avatar;
