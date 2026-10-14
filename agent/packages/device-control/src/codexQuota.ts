import type { CodexQuotaSnapshot } from '@tut/heterogeneous-agents/quota';
import {
  createQuotaCacheKey,
  fetchCodexQuota,
  QuotaSnapshotCache,
} from '@tut/heterogeneous-agents/quota-sampler';

export interface GetCodexQuotaParams {
  command?: string;
  env?: Record<string, string>;
  force?: boolean;
}

const quotaCache = new QuotaSnapshotCache<CodexQuotaSnapshot>();

export const getCodexQuota = (params: GetCodexQuotaParams = {}): Promise<CodexQuotaSnapshot> =>
  quotaCache.get(
    createQuotaCacheKey('codex', params.command, params.env),
    () => fetchCodexQuota({ ...params, includeResetCredits: false }),
    { force: params.force },
  );
