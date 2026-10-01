import type { ListDetailDto } from '@shoppy/shared';
import { useNavigate } from '@tanstack/react-router';
import { ConfirmSheet } from '@/components/ui/confirm-sheet';
import { Sheet } from '@/components/ui/sheet';
import { ListForm } from '@/features/lists/list-form';
import { useDeleteList } from '@/features/lists/use-delete-list';
import { ListMenuSheet, type ListMenuAction } from './list-menu-sheet';
import { useBulkEntries } from './use-bulk-entries';

export type ListDialog = 'menu' | 'edit' | 'check-all' | 'delete-all' | 'delete-list' | null;

interface ListDialogsProps {
  list: ListDetailDto;
  dialog: ListDialog;
  onMenuAction: (action: ListMenuAction) => void;
  onClose: () => void;
}

export function ListDialogs({ list, dialog, onMenuAction, onClose }: ListDialogsProps) {
  const navigate = useNavigate();
  const bulk = useBulkEntries(list.id);
  const deleteList = useDeleteList();
  const count = list.entries.length;
  const entries = `${count} ${count === 1 ? 'entry' : 'entries'}`;

  const bulkAll = (action: 'check' | 'delete') => {
    bulk.mutate({ action, all: true });
    onClose();
  };

  return (
    <>
      <ListMenuSheet
        isOpen={dialog === 'menu'}
        isArchived={list.isArchived}
        hasEntries={count > 0}
        onAction={onMenuAction}
        onClose={onClose}
      />
      <Sheet isOpen={dialog === 'edit'} onClose={onClose} title="Edit list">
        <ListForm list={list} onSaved={onClose} />
      </Sheet>
      <ConfirmSheet
        isOpen={dialog === 'check-all'}
        title="Check all entries?"
        confirmLabel="Move to history"
        onConfirm={() => bulkAll('check')}
        onClose={onClose}
      >
        All {entries} move to history as bought now.
      </ConfirmSheet>
      <ConfirmSheet
        isOpen={dialog === 'delete-all'}
        title="Delete all entries?"
        confirmLabel="Delete all"
        isDanger
        onConfirm={() => bulkAll('delete')}
        onClose={onClose}
      >
        All {entries} are removed for good. Nothing goes to history.
      </ConfirmSheet>
      <ConfirmSheet
        isOpen={dialog === 'delete-list'}
        title={`Delete ${list.name}?`}
        confirmLabel="Delete list"
        isDanger
        isPending={deleteList.isPending}
        onConfirm={() =>
          deleteList.mutate(list.id, { onSuccess: () => void navigate({ to: '/lists' }) })
        }
        onClose={onClose}
      >
        The list, its entries and its history are deleted for good.
      </ConfirmSheet>
    </>
  );
}
