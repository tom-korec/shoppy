import { memberSchema, type UpdateMemberInput } from '@shoppy/shared';
import { apiSend } from '@/lib/api';
import { useHouseholdMutation } from './use-household-mutation';

interface MemberUpdate {
  memberId: string;
  input: UpdateMemberInput;
}

export function useUpdateMember() {
  return useHouseholdMutation(({ memberId, input }: MemberUpdate) =>
    apiSend('PATCH', `/members/${memberId}`, input, memberSchema),
  );
}
