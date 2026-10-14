/**
 * Shared tool filtering logic used across both runtime (ToolsEngine)
 * and display layer (selectors)
 */
import { AuvManifest } from '@tut/builtin-tool-auv';
import { LocalSystemManifest } from '@tut/builtin-tool-local-system';
import { isToolEnabledByFeatureFlags } from '@tut/builtin-tools/featureGates';
import { isDesktop } from '@tut/const';

import { getServerConfigStoreState } from '@/store/serverConfig';

/**
 * Check if a tool should be enabled based on platform-specific constraints
 * @param toolId - The tool identifier to check
 * @returns true if the tool should be enabled, false otherwise
 */
export const shouldEnableTool = (toolId: string): boolean => {
  // Feature-flagged tools (e.g. tut-dashboard) are not listed or offered while off.
  if (!isToolEnabledByFeatureFlags(toolId, getServerConfigStoreState()?.featureFlags)) return false;

  // These executors call Electron IPC and cannot run in a plain web client.
  if (toolId === LocalSystemManifest.identifier || toolId === AuvManifest.identifier) {
    return isDesktop;
  }

  return true;
};

/**
 * Filter tool IDs based on platform constraints
 * @param toolIds - Array of tool identifiers to filter
 * @returns Filtered array of tool identifiers
 */
export const filterToolIds = (toolIds: string[]): string[] => {
  return toolIds.filter(shouldEnableTool);
};
