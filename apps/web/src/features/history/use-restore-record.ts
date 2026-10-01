import { useRecordToEntry } from './use-record-to-entry';

export function useRestoreRecord(listId: string) {
  return useRecordToEntry(listId, 'restore');
}
