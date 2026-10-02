import type { HouseholdDto } from '@shoppy/shared';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { SelectField } from '@/components/ui/select-field';
import { Sheet } from '@/components/ui/sheet';
import { useTransferOwnership } from './use-transfer-ownership';
import { useMembers } from './use-members';

interface TransferOwnershipSheetProps {
  isOpen: boolean;
  household: HouseholdDto;
  onClose: () => void;
}

// FR-H6: the new Owner gets every permission; the current Owner becomes an Admin.
export function TransferOwnershipSheet({
  isOpen,
  household,
  onClose,
}: TransferOwnershipSheetProps) {
  const members = useMembers(household.id);
  const transfer = useTransferOwnership(household.id);
  const candidates = (members.data ?? []).filter(({ role }) => role !== 'OWNER');
  const [memberId, setMemberId] = useState('');

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Transfer ownership">
      {candidates.length === 0 ? (
        <p className="text-muted-foreground">Invite someone first; ownership goes to a member.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground">You stay in the household as an admin.</p>
          {transfer.error && <FormAlert tone="error">{transfer.error.message}</FormAlert>}
          <SelectField
            label="New owner"
            value={memberId}
            onChange={(event) => setMemberId(event.target.value)}
          >
            <option value="" disabled>
              Choose a member
            </option>
            {candidates.map((member) => (
              <option key={member.id} value={member.id}>
                {member.displayName}
              </option>
            ))}
          </SelectField>
          <Button
            width="full"
            disabled={!memberId}
            isLoading={transfer.isPending}
            onClick={() => transfer.mutate(memberId, { onSuccess: onClose })}
          >
            Transfer ownership
          </Button>
        </div>
      )}
    </Sheet>
  );
}
