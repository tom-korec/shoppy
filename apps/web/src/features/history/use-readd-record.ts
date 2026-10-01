import { useRecordToEntry } from './use-record-to-entry';

export function useReaddRecord(listId: string) {
  return useRecordToEntry(listId, 'readd');
}
