import { normalizeForSearch } from './normalize-for-search';

describe('normalizeForSearch', () => {
  it('ignores case, accents and surrounding spaces', () => {
    expect(normalizeForSearch('  Crème Fraîche ')).toBe('creme fraiche');
  });
});
