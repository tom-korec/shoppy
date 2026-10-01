import { recentWindowDays, windowStart } from './recent-window-days.js';

const now = new Date('2026-10-01T12:00:00Z');
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

describe('recentWindowDays', () => {
  it('shows 7 days when the 10th newest purchase is within the last week', () => {
    expect(recentWindowDays(daysAgo(6), now)).toBe(7);
  });

  it('shows 7 days when the 10th newest purchase is exactly a week old', () => {
    expect(recentWindowDays(daysAgo(7), now)).toBe(7);
  });

  it('shows 30 days when the 10th newest purchase is older than a week', () => {
    expect(recentWindowDays(daysAgo(8), now)).toBe(30);
  });

  it('shows 30 days on a list without history', () => {
    expect(recentWindowDays(undefined, now)).toBe(30);
  });
});

describe('windowStart', () => {
  it('returns the start of the window', () => {
    expect(windowStart(7, now)).toEqual(daysAgo(7));
  });
});
