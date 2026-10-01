import { RECENT_HISTORY_WINDOWS_DAYS } from '@shoppy/shared';

const DAY_MS = 24 * 60 * 60 * 1000;

// FR-L12: `tenthNewest` is the 10th most recent purchase (or the oldest one on a list with fewer).
export function recentWindowDays(tenthNewest: Date | undefined, now: Date): 7 | 30 {
  const { busy, quiet } = RECENT_HISTORY_WINDOWS_DAYS;
  if (!tenthNewest) return quiet;
  return now.getTime() - tenthNewest.getTime() <= busy * DAY_MS ? busy : quiet;
}

export function windowStart(days: number, now: Date): Date {
  return new Date(now.getTime() - days * DAY_MS);
}
