import { bulkEntriesInputSchema, createEntryInputSchema, splitQuickAddText } from './entries.js';

describe('splitQuickAddText', () => {
  it('takes the text after the first comma as the note', () => {
    expect(splitQuickAddText(' Milk , 2 l, organic ')).toEqual({
      name: 'Milk',
      note: '2 l, organic',
    });
  });

  it('has no note without a comma', () => {
    expect(splitQuickAddText(' Milk ')).toEqual({ name: 'Milk', note: null });
  });

  it('has no note after a trailing comma', () => {
    expect(splitQuickAddText('Milk,')).toEqual({ name: 'Milk', note: null });
  });
});

describe('createEntryInputSchema', () => {
  const itemId = '01999d6c-6c4a-7c39-9a3f-3f5b1c2d4e5f';

  it('accepts a catalog item', () => {
    expect(createEntryInputSchema.safeParse({ itemId }).success).toBe(true);
  });

  it('accepts a one-time name', () => {
    expect(createEntryInputSchema.safeParse({ text: 'Milk' }).success).toBe(true);
  });

  it('rejects both an item and a name', () => {
    expect(createEntryInputSchema.safeParse({ itemId, text: 'Milk' }).success).toBe(false);
  });

  it('rejects a category on a catalog entry', () => {
    expect(createEntryInputSchema.safeParse({ itemId, categoryId: itemId }).success).toBe(false);
  });
});

describe('bulkEntriesInputSchema', () => {
  it('needs either ids or all', () => {
    expect(bulkEntriesInputSchema.safeParse({ action: 'check' }).success).toBe(false);
    expect(bulkEntriesInputSchema.safeParse({ action: 'check', all: true }).success).toBe(true);
  });

  it('rejects the same id twice', () => {
    const id = '01999d6c-6c4a-7c39-9a3f-3f5b1c2d4e5f';

    expect(bulkEntriesInputSchema.safeParse({ action: 'check', ids: [id, id] }).success).toBe(
      false,
    );
  });
});
