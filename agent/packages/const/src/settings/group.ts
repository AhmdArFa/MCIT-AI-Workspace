import type {
  TutChatGroupChatConfig,
  TutChatGroupFullConfig,
  TutChatGroupMetaConfig,
} from '@tut/types';

export const DEFAULT_CHAT_GROUP_CHAT_CONFIG: TutChatGroupChatConfig = {
  allowDM: true,
  openingMessage: '',
  openingQuestions: [],
  revealDM: false,
  systemPrompt: '',
};

export const DEFAULT_CHAT_GROUP_META_CONFIG: TutChatGroupMetaConfig = {
  description: '',
  title: '',
};

export const DEFAULT_CHAT_GROUP_CONFIG: TutChatGroupFullConfig = {
  chat: DEFAULT_CHAT_GROUP_CHAT_CONFIG,
  meta: DEFAULT_CHAT_GROUP_META_CONFIG,
};
