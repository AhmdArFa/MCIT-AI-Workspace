import { describe, expect, it } from 'vitest';

import enUSModels from '../../../locales/en-US/models.json';
import zhCNModels from '../../../locales/zh-CN/models.json';
import { tutHubOnlineModelDescriptions } from './mcitOnlineModelDescriptions';

const enUSDescriptions = enUSModels as Record<string, string>;
const zhCNDescriptions = zhCNModels as Record<string, string>;

const addedDescriptionKeys = [
  'mcit.deepseek-v4-flash-vision-exp.description',
  'mcit.gemini-3.1-flash-image.description',
  'mcit.gemini-3.1-flash-image:image.description',
  'mcit.gemini-3.7-flash.description',
  'mcit.glm-5.3-flash.description',
  'mcit.qwen3.8-max.description',
  'mcit.grok-4.6.description',
  'mcit.grok-4.7.description',
  'mcit.mimo-v2.6-flash.description',
  'mcit.mimo-v2.6-pro-ultraspeed.description',
  'mcit.mimo-v2.6-pro.description',
] as const;

describe('MCIT AI online model descriptions', () => {
  it.each(addedDescriptionKeys)('ships English and Chinese translations for %s', (key) => {
    expect(enUSDescriptions[key]).toBe(tutHubOnlineModelDescriptions[key]);
    expect(zhCNDescriptions[key]).toMatch(/[\u3400-\u9FFF]/u);
  });

  it.each([
    ['gemini-3.1-flash-image.description', 'gemini-3.1-flash-image-preview.description'],
    [
      'gemini-3.1-flash-image:image.description',
      'gemini-3.1-flash-image-preview:image.description',
    ],
  ])('ships the stable Google translation for %s', (stableKey, previewKey) => {
    expect(enUSDescriptions[stableKey]).toBe(enUSDescriptions[previewKey]);
    expect(zhCNDescriptions[stableKey]).toBe(zhCNDescriptions[previewKey]);
  });
});
