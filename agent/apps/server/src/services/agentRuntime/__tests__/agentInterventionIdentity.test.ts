// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  deriveAgentInterventionActivityKey,
  deriveAgentInterventionContinuationMessageId,
  deriveAgentInterventionContinuationOperationId,
  deriveAgentInterventionQueueDeduplicationId,
  hashAgentInterventionRequestRevision,
  matchesAgentInterventionContinuationProvenance,
} from '@/business/server/agent-run/agentInterventionIdentity';

describe('agent intervention identity', () => {
  it('shares the raw-arguments revision vector used by the database CAS', () => {
    expect(hashAgentInterventionRequestRevision('{"path":"/tmp/a"}')).toBe(
      '15df809ad5fadb66f0b31bafc206dcfe620d8da8767fb76e41d3603a45dc870d',
    );
    expect(hashAgentInterventionRequestRevision('{ "path": "/tmp/a" }')).not.toBe(
      hashAgentInterventionRequestRevision('{"path":"/tmp/a"}'),
    );
  });

  it('shares the domain-separated Cloud activity-key vector', () => {
    expect(
      deriveAgentInterventionActivityKey({
        batchId: 'batch-1',
        operationId: 'operation-1',
        userId: 'user-1',
        workspaceId: 'workspace-1',
      }),
    ).toBe('3f1db135-0bf4-5881-be8e-f225fa3f1c04');
  });

  it('separates personal and workspace activity identities', () => {
    const common = {
      batchId: 'batch-1',
      operationId: 'operation-1',
      userId: 'user-1',
    };
    expect(deriveAgentInterventionActivityKey(common)).not.toBe(
      deriveAgentInterventionActivityKey({ ...common, workspaceId: 'workspace-1' }),
    );
  });

  it('derives one stable continuation operation from the resolution request', () => {
    const identity = {
      resolutionRequestId: '018fbd8e-7baf-7c6d-8000-000000000014',
      userId: 'user-1',
      workspaceId: 'workspace-1',
    };
    expect(deriveAgentInterventionContinuationOperationId(identity)).toBe(
      'op_intervention_1d6cf32bc55b08427f651a343d097e9f',
    );
    expect(deriveAgentInterventionContinuationMessageId(identity)).toBe(
      'msg_intervention_45cca4fb39efadcb5c1e22b6505518f3',
    );
    expect(
      deriveAgentInterventionQueueDeduplicationId(
        'op_intervention_1d6cf32bc55b08427f651a343d097e9f',
        0,
      ),
    ).toBe('agent-intervention:op_intervention_1d6cf32bc55b08427f651a343d097e9f:0');
    expect(
      deriveAgentInterventionContinuationOperationId({ ...identity, userId: 'user-2' }),
    ).not.toBe(deriveAgentInterventionContinuationOperationId(identity));
  });

  it('matches JSONB provenance by exact semantic fields and unordered item ids', () => {
    const expected = {
      resolutionRequestId: 'request-1',
      sourceOperationId: 'operation-source',
      sourceToolMessageIds: ['tool-b', 'tool-a'],
    };
    expect(
      matchesAgentInterventionContinuationProvenance(
        {
          sourceToolMessageIds: ['tool-a', 'tool-b'],
          sourceOperationId: 'operation-source',
          resolutionRequestId: 'request-1',
        },
        expected,
      ),
    ).toBe(true);
    expect(
      matchesAgentInterventionContinuationProvenance(
        { ...expected, sourceToolMessageIds: ['tool-a', 'tool-other'] },
        expected,
      ),
    ).toBe(false);
    expect(
      matchesAgentInterventionContinuationProvenance(
        { ...expected, sourceOperationId: 'operation-other' },
        expected,
      ),
    ).toBe(false);
    expect(
      matchesAgentInterventionContinuationProvenance(
        { ...expected, unexpectedAuthority: 'do-not-ignore' },
        expected,
      ),
    ).toBe(false);
  });
});
