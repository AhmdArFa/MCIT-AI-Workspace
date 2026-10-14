import type { UserGeneralConfig } from '@tut/types';
import { VENDOR_THEME } from '@tut/vendor-bridge/css';

export const DEFAULT_COST_ESTIMATE_WARNING_THRESHOLD = 0.5;

export const DEFAULT_COMMON_SETTINGS: UserGeneralConfig = {
  animationMode: 'agile',
  // contextMenuMode not set default value, use env to calc
  costEstimateWarningThreshold: DEFAULT_COST_ESTIMATE_WARNING_THRESHOLD,
  fontSize: 14,
  highlighterTheme: VENDOR_THEME,
  isDevMode: false,
  isLiteMode: false,
  mermaidTheme: VENDOR_THEME,
  telemetry: false,
  transitionMode: 'fadeIn',
};
