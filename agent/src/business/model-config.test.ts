import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockIsProviderModelAvailable = vi.fn();
const mockLoadModelBankModels = vi.fn();

vi.mock('model-bank', () => ({
  isProviderModelAvailable: mockIsProviderModelAvailable,
  loadModels: mockLoadModelBankModels,
  ModelProvider: { Mcit: 'mcit' },
}));

const { isMcitModelAvailable } = await import('@tut/business-model-bank/model-config');

describe('business model config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should disable MCIT AI model availability by default', () => {
    const getUserEmail = vi.fn();

    expect(isMcitModelAvailable('image-model', 'image', { getUserEmail })).toBe(false);

    expect(mockLoadModelBankModels).not.toHaveBeenCalled();
    expect(mockIsProviderModelAvailable).not.toHaveBeenCalled();
    expect(getUserEmail).not.toHaveBeenCalled();
  });
});
