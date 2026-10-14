import { type TutToolCustomPlugin } from '@/types/tool/plugin';

export interface CustomPluginState {
  customPluginSearchKeywords?: string;
  newCustomPlugin: Partial<TutToolCustomPlugin>;
}
export const defaultCustomPlugin: Partial<TutToolCustomPlugin> = {
  customParams: {
    apiMode: 'simple',
    enableSettings: false,
    manifestMode: 'url',
  },
  type: 'customPlugin',
};

export const initialCustomPluginState: CustomPluginState = {
  customPluginSearchKeywords: '',
  newCustomPlugin: defaultCustomPlugin,
};
