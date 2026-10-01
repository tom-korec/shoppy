import { listRouteParams } from './list-route-params';

describe('listRouteParams', () => {
  it('accepts a list id', () => {
    const listId = '01999d6c-6c4a-7c39-9a3f-000000000001';

    expect(listRouteParams.parse({ listId })).toEqual({ listId });
  });

  it('rejects a path smuggled into the id', () => {
    expect(() => listRouteParams.parse({ listId: '../auth/logout?' })).toThrow();
  });
});
