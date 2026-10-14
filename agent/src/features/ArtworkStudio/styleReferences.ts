import { imageUrl } from '@tut/const';
import type { AgentArtworkStyle } from '@tut/prompts';

import { CHIEF_AGENT_ARTWORKS } from '@/features/ChiefAgent/artwork';

/**
 * Three hue-diverse official mascots. Enough images to pin the rendering
 * style, while the variety keeps the model from copying one character
 * instead of inventing a subject for the agent.
 */
const REFERENCE_IDS = new Set(['tut', 'byte', 'buttercup']);

export const TUT_STYLE_REFERENCE_IMAGE_URLS = CHIEF_AGENT_ARTWORKS.filter((item) =>
  REFERENCE_IDS.has(item.id),
).map((item) => item.avatar);

const lineArtReferenceImageUrl = (appOrigin: string) =>
  new URL(imageUrl('agent-artwork-styles/line-art-reference.webp'), appOrigin).toString();

export const styleReferencesForArtworkStyle = (
  style: AgentArtworkStyle,
  appOrigin?: string,
): string[] | undefined =>
  style === 'tut'
    ? TUT_STYLE_REFERENCE_IMAGE_URLS
    : style === 'lineArt' && appOrigin
      ? [lineArtReferenceImageUrl(appOrigin)]
      : undefined;
