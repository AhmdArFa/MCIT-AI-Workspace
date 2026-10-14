import type { UserSystemAgentConfig } from '@tut/types';

import { UserModel } from '@/database/models/user';
import type { TutChatDatabase } from '@/database/type';
import { resolveSystemAgentModelConfig } from '@/server/services/systemAgent/modelConfig';

export const resolveExpertiseModelConfig = async (db: TutChatDatabase, userId: string) => {
  const settings = await new UserModel(db, userId).getUserSettings();
  const systemAgent = settings?.systemAgent as Partial<UserSystemAgentConfig> | undefined;

  return resolveSystemAgentModelConfig({
    taskConfig: systemAgent?.expertise,
    taskKey: 'expertise',
  });
};
