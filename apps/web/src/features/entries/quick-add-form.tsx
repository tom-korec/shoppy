import {
  type CategoryDto,
  type ItemDto,
  type PurchaseRecordDto,
  splitQuickAddText,
} from '@shoppy/shared';
import { History, Plus } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { cn } from '@/lib/cn';
import { normalizeForSearch } from '@/lib/normalize-for-search';
import type { EntryDraft } from './new-entry';
import { findItemByName, quickAddSuggestions, type Suggestion } from './quick-add-suggestions';
import { SuggestionButton } from './suggestion-button';

interface QuickAddFormProps {
  items: ItemDto[];
  categories: CategoryDto[];
  recentRecords: PurchaseRecordDto[];
  placement: 'above' | 'below';
  onAdd: (draft: EntryDraft) => void;
}

// FR-L6. "milk, 2 l" adds Milk with the note "2 l". The input keeps focus, so several things
// can be added in a row.
export function QuickAddForm({
  items,
  categories,
  recentRecords,
  placement,
  onAdd,
}: QuickAddFormProps) {
  const [text, setText] = useState('');
  const { name, note } = splitQuickAddText(text);
  const suggestions = quickAddSuggestions(name, items, recentRecords);
  const exactItem = findItemByName(items, name);

  const add = (draft: EntryDraft) => {
    onAdd(draft);
    setText('');
  };

  const addTyped = () => {
    if (!name) return;
    add(exactItem ? { item: exactItem, note } : { text: name, categoryId: null, note });
  };

  const pick = (suggestion: Suggestion) => {
    if (suggestion.kind === 'item') return add({ item: suggestion.item, note });
    const categoryName = suggestion.categoryName && normalizeForSearch(suggestion.categoryName);
    const category = categories.find((c) => normalizeForSearch(c.name) === categoryName);
    add({ text: suggestion.name, categoryId: category?.id ?? null, note });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    addTyped();
  };

  const hasOptions = name.length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex gap-2', placement === 'above' ? 'flex-col-reverse' : 'flex-col')}
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Add to list"
          placeholder="Add, e.g. milk, 2 l"
          autoComplete="off"
          autoCorrect="off"
          enterKeyHint="enter"
          maxLength={300}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-card px-3 text-base outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <button
          type="submit"
          aria-label="Add"
          disabled={!name}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
        >
          <Plus className="size-5" aria-hidden />
        </button>
      </div>
      {hasOptions && (
        <ul
          aria-label="Suggestions"
          className="flex max-h-64 flex-col overflow-y-auto rounded-xl border border-border bg-card shadow-lg"
        >
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.kind === 'item' ? suggestion.item.id : `history:${suggestion.name}`}
            >
              <SuggestionButton onPick={() => pick(suggestion)}>
                {suggestion.kind === 'history' && (
                  <History className="size-4 text-muted-foreground" aria-hidden />
                )}
                <span className="truncate">
                  {suggestion.kind === 'item' ? suggestion.item.name : suggestion.name}
                </span>
              </SuggestionButton>
            </li>
          ))}
          {!exactItem && (
            <li>
              <SuggestionButton onPick={addTyped}>
                <Plus className="size-4 text-muted-foreground" aria-hidden />
                <span className="truncate">
                  Add “{name}” <span className="text-muted-foreground">(one-time)</span>
                </span>
              </SuggestionButton>
            </li>
          )}
        </ul>
      )}
    </form>
  );
}
