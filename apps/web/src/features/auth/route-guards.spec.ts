import { safeRedirectPath } from './route-guards';

describe('safeRedirectPath', () => {
  it('keeps an app path', () => {
    expect(safeRedirectPath('/lists?x=1')).toBe('/lists?x=1');
  });

  it.each([undefined, 'https://evil.example', '//evil.example', '/\\evil.example', 'lists'])(
    'falls back to home for %j',
    (path) => {
      expect(safeRedirectPath(path)).toBe('/');
    },
  );
});
