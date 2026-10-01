import type { ItemDto } from '@shoppy/shared';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmSheet } from '@/components/ui/confirm-sheet';
import { Sheet } from '@/components/ui/sheet';
import { ItemForm } from './item-form';
import { useDeleteItem } from './use-delete-item';

interface ItemSheetProps {
  isOpen: boolean;
  item?: ItemDto;
  initialCategoryId?: string;
  onClose: () => void;
}

export function ItemSheet({ isOpen, item, initialCategoryId, onClose }: ItemSheetProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const deleteItem = useDeleteItem();

  const confirmDelete = () => {
    if (!item) return;
    deleteItem.mutate(item.id, {
      onSuccess: () => {
        setIsConfirmingDelete(false);
        onClose();
      },
    });
  };

  return (
    <>
      <Sheet
        isOpen={isOpen && !isConfirmingDelete}
        onClose={onClose}
        title={item ? 'Edit item' : 'New item'}
      >
        <ItemForm item={item} initialCategoryId={initialCategoryId} onSaved={onClose} />
        {item && (
          <Button variant="danger" width="full" onClick={() => setIsConfirmingDelete(true)}>
            <Trash2 className="size-4" aria-hidden />
            Delete item
          </Button>
        )}
      </Sheet>
      <ConfirmSheet
        isOpen={isConfirmingDelete}
        title={`Delete ${item?.name ?? 'item'}?`}
        confirmLabel="Delete"
        isDanger
        isPending={deleteItem.isPending}
        onConfirm={confirmDelete}
        onClose={() => setIsConfirmingDelete(false)}
      >
        It leaves the catalog. Lists that have it keep it as a one-time entry, and history stays.
      </ConfirmSheet>
    </>
  );
}
