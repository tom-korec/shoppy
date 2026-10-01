import { formatRelativeTime } from './format-relative-time';

const NOW = Date.parse('2026-10-01T12:00:00Z');

describe('formatRelativeTime', () => {
  it('says "just now" for under a minute', () => {
    expect(formatRelativeTime('2026-10-01T11:59:30Z', NOW)).toBe('just now');
  });

  it('uses minutes and hours', () => {
    expect(formatRelativeTime('2026-10-01T11:55:00Z', NOW)).toBe('5 minutes ago');
    expect(formatRelativeTime('2026-10-01T09:00:00Z', NOW)).toBe('3 hours ago');
  });

  it('says "yesterday" for one day', () => {
    expect(formatRelativeTime('2026-09-30T12:00:00Z', NOW)).toBe('yesterday');
  });
});
