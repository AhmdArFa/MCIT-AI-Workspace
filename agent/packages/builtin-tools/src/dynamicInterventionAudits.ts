import { createDryRunAudit, DASHBOARD_DRY_RUN_AUDIT } from '@tut/builtin-tool-dashboard';
import { pathScopeAudit } from '@tut/builtin-tool-local-system';
import { type DynamicInterventionResolver } from '@tut/types';

export const dynamicInterventionAudits: Record<string, DynamicInterventionResolver> = {
  // Without a version loader this asks the user for every dry run; hosts that
  // can read the version (agent runtime service, client streaming executor)
  // register a loader-backed audit under the same key.
  [DASHBOARD_DRY_RUN_AUDIT]: createDryRunAudit(),
  pathScopeAudit,
};
