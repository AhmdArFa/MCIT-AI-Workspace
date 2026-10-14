import type { NeonDatabase } from 'drizzle-orm/neon-serverless';

import type * as schema from './schemas';

export type TutChatDatabaseSchema = typeof schema;

export type TutChatDatabase = NeonDatabase<TutChatDatabaseSchema>;

export type Transaction = Parameters<Parameters<TutChatDatabase['transaction']>[0]>[0];
