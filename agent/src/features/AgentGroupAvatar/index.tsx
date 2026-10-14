'use client';

import { Avatar } from '@mcit-vendor/ui/base-ui';
import { memo } from 'react';

import { responsiveAvatarSize } from '@/components/Avatar/responsiveSize';
import GroupAvatar from '@/features/GroupAvatar';
import { useIsMobile } from '@/hooks/useIsMobile';

export interface AgentGroupAvatarProps {
  /**
   * Custom avatar for the group (emoji or url)
   */
  avatar?: string;
  /**
   * Background color for custom avatar
   */
  backgroundColor?: string;
  /**
   * Member avatars to display when no custom avatar
   */
  memberAvatars?: { avatar?: string; background?: string }[];
  /**
   * Avatar size
   */
  size?: number;
}

const AgentGroupAvatar = memo<AgentGroupAvatarProps>(
  ({ avatar, backgroundColor, memberAvatars = [], size: baseSize = 28 }) => {
    const size = responsiveAvatarSize(baseSize, useIsMobile());
    // If group has custom avatar, show it; otherwise show member avatars composition
    if (avatar) {
      return (
        <Avatar
          emojiScaleWithBackground
          avatar={avatar}
          background={backgroundColor}
          shape="square"
          size={size}
          style={{ flex: 'none' }}
        />
      );
    }

    return <GroupAvatar avatars={memberAvatars} background={backgroundColor} size={size} />;
  },
);

export default AgentGroupAvatar;
