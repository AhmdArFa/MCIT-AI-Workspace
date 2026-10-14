import { type FC } from 'react';

import { TUT_LINK_TAG } from './parse';
import { rehypeTutLink } from './rehypePlugin';
import Render from './Render';
import { type EntityLinkElementProps } from './types';

/**
 * The entity-link markdown element, host-agnostic: one rehype pass that rewrites
 * internal anchors into `<tutLink>`, plus the renderer that turns them into
 * inline chips.
 *
 * The conversation mounts it through its markdown plugin registry; every other
 * reading surface mounts the same element through `useEntityMarkdown()`, so one
 * place owns what an internal link looks like and where it opens.
 */
export const EntityLinkElement = {
  Component: Render as FC<EntityLinkElementProps>,
  rehypePlugin: rehypeTutLink,
  scope: 'all' as const,
  tag: TUT_LINK_TAG,
};

export default EntityLinkElement;
