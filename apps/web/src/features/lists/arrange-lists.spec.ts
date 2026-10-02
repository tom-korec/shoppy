import type { ListDto } from '@shoppy/shared';
import { sectionLists, sortLists } from './arrange-lists';

let next = 0;
function list(overrides: Partial<ListDto>): ListDto {
  next += 1;
  return {
    id: `01999d6c-6c4a-7c39-9a3f-${String(next).padStart(12, '0')}`,
    name: `List ${next}`,
    icon: 'store',
    isArchived: false,
    entryCount: 0,
    scope: { kind: 'personal' },
    createdAt: '2026-10-01T10:00:00.000Z',
    lastActivityAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  };
}

const HOME = {
  kind: 'household' as const,
  householdId: '01999d6c-6c4a-7c39-9a3f-0000000000aa',
  householdName: 'Home',
};
const BEACH = {
  kind: 'household' as const,
  householdId: '01999d6c-6c4a-7c39-9a3f-0000000000bb',
  householdName: 'Beach',
};

describe('sortLists', () => {
  const old = list({
    name: 'Old',
    createdAt: '2026-09-01T00:00:00.000Z',
    lastActivityAt: '2026-10-02T00:00:00.000Z',
  });
  const recent = list({
    name: 'Recent',
    createdAt: '2026-10-01T00:00:00.000Z',
    lastActivityAt: '2026-10-01T00:00:00.000Z',
  });
  const newest = list({
    name: 'Newest',
    createdAt: '2026-10-02T00:00:00.000Z',
    lastActivityAt: '2026-09-01T00:00:00.000Z',
  });
  const names = (lists: ListDto[]) => lists.map(({ name }) => name);

  it('sorts by last activity', () => {
    expect(names(sortLists([recent, newest, old], { sort: 'ACTIVITY', customOrder: [] }))).toEqual([
      'Old',
      'Recent',
      'Newest',
    ]);
  });

  it('sorts by creation, newest first', () => {
    expect(names(sortLists([old, newest, recent], { sort: 'CREATED', customOrder: [] }))).toEqual([
      'Newest',
      'Recent',
      'Old',
    ]);
  });

  it('puts custom-ordered lists first and newer ones after', () => {
    const sorted = sortLists([old, recent, newest], {
      sort: 'CUSTOM',
      customOrder: [old.id, recent.id],
    });

    expect(names(sorted)).toEqual(['Old', 'Recent', 'Newest']);
  });
});

describe('sectionLists', () => {
  it('groups by Personal, then households by name', () => {
    const lists = [list({ scope: HOME }), list({}), list({ scope: BEACH })];

    expect(sectionLists(lists, true).map(({ title }) => title)).toEqual([
      'Personal',
      'Beach',
      'Home',
    ]);
  });

  it('skips empty groups', () => {
    expect(sectionLists([list({ scope: HOME })], true).map(({ title }) => title)).toEqual(['Home']);
  });

  it('keeps one untitled section when grouping is off', () => {
    const lists = [list({ scope: HOME }), list({})];

    expect(sectionLists(lists, false)).toEqual([{ key: 'all', title: null, lists }]);
  });
});
