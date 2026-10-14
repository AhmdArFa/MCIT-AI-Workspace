import { type GlobalInterventionAuditConfig } from '@tut/types';

import { createSecurityBlacklistGlobalAudit } from './createSecurityBlacklistAudit';

export const createDefaultGlobalAudits = (): GlobalInterventionAuditConfig[] => [
  createSecurityBlacklistGlobalAudit(),
  createSecurityBlacklistGlobalAudit('required'),
];
