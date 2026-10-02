import { apiCommand } from '@/lib/api';
import { useHouseholdMutation } from './use-household-mutation';

export function useRemoveMember() {
  return useHouseholdMutation((memberId: string) => apiCommand('DELETE', `/members/${memberId}`));
}
