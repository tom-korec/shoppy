import { type HouseholdDto, householdInputSchema } from '@shoppy/shared';
import { useNavigate } from '@tanstack/react-router';
import { Crown, LogOut, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmSheet } from '@/components/ui/confirm-sheet';
import { FormAlert } from '@/components/ui/form-alert';
import { Section } from '@/components/ui/section';
import { Sheet } from '@/components/ui/sheet';
import { SheetAction } from '@/components/ui/sheet-action';
import { TextField } from '@/components/ui/text-field';
import { useZodForm } from '@/components/ui/use-zod-form';
import { TransferOwnershipSheet } from './transfer-ownership-sheet';
import { useDeleteHousehold } from './use-delete-household';
import { useLeaveHousehold } from './use-leave-household';
import { useRenameHousehold } from './use-rename-household';

type Dialog = 'rename' | 'transfer' | 'leave' | 'delete' | null;

interface HouseholdSettingsProps {
  household: HouseholdDto;
}

export function HouseholdSettings({ household }: HouseholdSettingsProps) {
  const navigate = useNavigate();
  const rename = useRenameHousehold(household.id);
  const leave = useLeaveHousehold(household.id);
  const remove = useDeleteHousehold(household.id);
  const [dialog, setDialog] = useState<Dialog>(null);
  const can = (permission: (typeof household.myPermissions)[number]) =>
    household.myPermissions.includes(permission);
  const isOwner = household.myRole === 'OWNER';
  const goToProfile = () => void navigate({ to: '/profile' });

  const form = useZodForm(householdInputSchema, { name: household.name }, (input) =>
    rename.mutate(input, { onSuccess: () => setDialog(null) }),
  );

  return (
    <Section title="Household">
      <div className="-mx-1 flex flex-col">
        {can('household.rename') && (
          <SheetAction icon={Pencil} label="Rename" onClick={() => setDialog('rename')} />
        )}
        {can('household.transfer') && (
          <SheetAction
            icon={Crown}
            label="Transfer ownership"
            onClick={() => setDialog('transfer')}
          />
        )}
        {!isOwner && (
          <SheetAction
            icon={LogOut}
            label="Leave household"
            isDanger
            onClick={() => setDialog('leave')}
          />
        )}
        {can('household.delete') && (
          <SheetAction
            icon={Trash2}
            label="Delete household"
            isDanger
            onClick={() => setDialog('delete')}
          />
        )}
      </div>
      {isOwner && (
        <p className="text-sm text-muted-foreground">
          To leave, transfer ownership to another member first.
        </p>
      )}
      <Sheet isOpen={dialog === 'rename'} onClose={() => setDialog(null)} title="Rename household">
        <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
          {rename.error && <FormAlert tone="error">{rename.error.message}</FormAlert>}
          <TextField label="Name" autoComplete="off" {...form.field('name')} />
          <Button type="submit" width="full" isLoading={rename.isPending}>
            Save
          </Button>
        </form>
      </Sheet>
      <TransferOwnershipSheet
        isOpen={dialog === 'transfer'}
        household={household}
        onClose={() => setDialog(null)}
      />
      <ConfirmSheet
        isOpen={dialog === 'leave'}
        title={`Leave ${household.name}?`}
        confirmLabel="Leave"
        isDanger
        isPending={leave.isPending}
        onConfirm={() => leave.mutate(undefined, { onSuccess: goToProfile })}
        onClose={() => setDialog(null)}
      >
        You lose access to its lists until someone invites you again.
      </ConfirmSheet>
      <ConfirmSheet
        isOpen={dialog === 'delete'}
        title={`Delete ${household.name}?`}
        confirmLabel="Delete household"
        isDanger
        isPending={remove.isPending}
        onConfirm={() => remove.mutate(undefined, { onSuccess: goToProfile })}
        onClose={() => setDialog(null)}
      >
        All its lists, catalog items, categories and history are deleted for everyone. This can't be
        undone.
      </ConfirmSheet>
    </Section>
  );
}
