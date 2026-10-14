// @vitest-environment node
import type * as BusinessConst from '@tut/business-const';
import { OFFICIAL_PROVIDER_DISABLE_ERROR } from '@tut/business-const';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TutChatDatabase } from '@/database/type';

import { ProviderService } from './provider.service';

vi.mock('@/const/rbac', () => ({
  ALL_SCOPE: 'all',
}));

vi.mock('@tut/database', () => ({
  buildWorkspacePayload: vi.fn(),
  buildWorkspaceWhere: vi.fn(),
}));

vi.mock('@/database/models/rbac', () => ({
  RbacModel: class {},
}));

vi.mock('@/database/schemas', () => ({
  agents: {},
  aiModels: {},
  aiProviders: {},
  files: {},
  knowledgeBases: {},
  messages: {},
  sessions: {},
  topics: {},
}));

vi.mock('@/server/modules/KeyVaultsEncrypt', () => ({
  KeyVaultsGateKeeper: {
    initWithEnvKey: vi.fn(),
  },
}));

vi.mock('@/utils/rbac', () => ({
  getScopePermissions: vi.fn(() => []),
}));

vi.mock('@tut/business-const', async () => {
  const actual = await vi.importActual<typeof BusinessConst>('@tut/business-const');

  return {
    ...actual,
    BRANDING_PROVIDER: 'mcit',
    ENABLE_BUSINESS_FEATURES: true,
    isOfficialProvider: (id: string) => id === 'mcit',
  };
});

describe('ProviderService', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createService = () => new ProviderService({} as TutChatDatabase, 'test-user-id');

  describe('official provider guard', () => {
    it('should reject creating the official provider as disabled', async () => {
      const service = createService();

      await expect(
        service.createProvider({
          enabled: false,
          id: 'mcit',
        }),
      ).rejects.toMatchObject({
        message: OFFICIAL_PROVIDER_DISABLE_ERROR,
        name: 'BusinessError',
      });
    });

    it('should reject updating the official provider as disabled', async () => {
      const service = createService();

      await expect(
        service.updateProvider({
          enabled: false,
          id: 'mcit',
        }),
      ).rejects.toMatchObject({
        message: OFFICIAL_PROVIDER_DISABLE_ERROR,
        name: 'BusinessError',
      });
    });
  });
});
