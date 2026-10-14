import type { TutChatDatabase } from '../type';
import { getDBInstance } from './web-server';

/**
 * Lazy-load database instance
 * Avoid initializing the database every time the module is imported
 */
let cachedDB: TutChatDatabase | null = null;

export const getServerDB = async (): Promise<TutChatDatabase> => {
  // If there's already a cached instance, return it directly
  if (cachedDB) return cachedDB;

  try {
    // Select the appropriate database instance based on the environment
    cachedDB = getDBInstance();
    return cachedDB;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

export const serverDB = new Proxy({} as TutChatDatabase, {
  get(target, prop, receiver) {
    if (!cachedDB) {
      cachedDB = getDBInstance();
    }
    return Reflect.get(cachedDB, prop, receiver);
  },
});
