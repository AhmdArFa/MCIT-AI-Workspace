import { formatDuration as formatDurationMs } from '@tut/utils';

export const formatDuration = (ms: number): string => formatDurationMs(ms, { minUnit: 's' });

export const formatDurationMinutes = (ms: number): string => {
  const minutes = Math.round(ms / 60_000);
  return `${minutes}`;
};
