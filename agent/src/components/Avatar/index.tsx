'use client';

import { Avatar as TutAvatar, type AvatarProps as TutAvatarProps } from '@mcit-vendor/ui/base-ui';
import { memo } from 'react';

import { DEFAULT_AVATAR } from '@/const/meta';
import { useIsMobile } from '@/hooks/useIsMobile';

import { remoteAvatarSrc, resolveAvatar } from './fallback';
import { responsiveAvatarSize } from './responsiveSize';
import { useBrokenSrc } from './useBrokenSrc';

export interface AvatarProps extends TutAvatarProps {
  /**
   * Seed for the fallback initials. Defaults to `title`; pass it when the
   * visible name differs from the tooltip title.
   */
  name?: string;
  /**
   * Step the size down on phones (see `responsiveAvatarSize`). Used by the
   * agent page: session list, conversation header, messages and home hero.
   */
  responsive?: boolean;
}

/**
 * Avatar with an identity-preserving fallback.
 *
 * `@mcit-vendor/ui`'s Avatar falls back to `String(title).slice(0, 2)`, which
 * renders a literal "UN" — the first letters of `"undefined"` — whenever the
 * image 404s and no title was passed. This wrapper derives the initials from
 * the name instead, so a missing image still reads as *this* agent rather than
 * as a broken one.
 *
 * The image element is rendered here rather than left to the library so this
 * component owns the `error` event. Probing the URL separately would let the
 * two disagree, and on disagreement the library's own "UN" fallback wins.
 */
const Avatar = memo<AvatarProps>(
  ({
    alt,
    avatar,
    background,
    name,
    responsive,
    size: baseSize = 48,
    style,
    title,
    unoptimized,
    ...rest
  }) => {
    const mobile = useIsMobile();
    const size = responsive ? responsiveAvatarSize(baseSize, mobile) : baseSize;
    const effectiveAvatar = avatar || DEFAULT_AVATAR;
    const src = remoteAvatarSrc(effectiveAvatar);
    const [isBroken, markBroken] = useBrokenSrc(src);

    const displaySrc = isBroken && src !== DEFAULT_AVATAR ? DEFAULT_AVATAR : src;
    const imgAlt = alt || name || title || 'avatar';
    const resolved = resolveAvatar({
      avatar:
        displaySrc ? (
          <img
            alt={imgAlt}
            draggable={false}
            height={size}
            loading={'lazy'}
            src={displaySrc}
            style={{
              borderRadius: 'inherit',
              display: 'block',
              height: '100%',
              objectFit: 'cover',
              width: '100%',
            }}
            width={size}
            onError={() => {
              if (displaySrc !== DEFAULT_AVATAR) {
                markBroken();
              }
            }}
          />
        ) : (
          effectiveAvatar
        ),
      background,
      isBroken: isBroken && displaySrc === DEFAULT_AVATAR,
      name,
      title,
    });

    return (
      <TutAvatar
        {...rest}
        alt={imgAlt}
        avatar={resolved.avatar}
        background={resolved.background}
        size={size}
        // never squeezed by a flex row (long titles used to shrink it)
        style={{
          borderRadius: rest.shape === 'circle' ? '50%' : 10,
          flex: 'none',
          overflow: 'hidden',
          ...style,
        }}
        title={title}
        unoptimized={unoptimized}
      />
    );
  },
);

Avatar.displayName = 'Avatar';

export default Avatar;
