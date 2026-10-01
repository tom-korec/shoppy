export const LISTS_QUERY_KEY_ROOT = ['lists'];
export const LISTS_QUERY_KEY = ['lists', 'personal'];

// Nested under the list, so invalidating a list also refreshes its history.
export const listDetailKey = (listId: string) => ['lists', 'detail', listId];
export const recentHistoryKey = (listId: string) => [...listDetailKey(listId), 'recent-history'];
export const historyKey = (listId: string) => [...listDetailKey(listId), 'history'];
