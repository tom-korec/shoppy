import type { CategoryDto } from '@shoppy/shared';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmSheet } from '@/components/ui/confirm-sheet';
import { Sheet } from '@/components/ui/sheet';
import { CategoryForm } from './category-form';
import { useDeleteCategory } from './use-delete-category';

interface CategorySheetProps {
  isOpen: boolean;
  category?: CategoryDto;
  onClose: () => void;
}

export function CategorySheet({ isOpen, category, onClose }: CategorySheetProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const deleteCategory = useDeleteCategory();

  const confirmDelete = () => {
    if (!category) return;
    deleteCategory.mutate(category.id, {
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
        title={category ? 'Edit category' : 'New category'}
      >
        <CategoryForm category={category} onSaved={onClose} />
        {category && (
          <Button variant="danger" width="full" onClick={() => setIsConfirmingDelete(true)}>
            <Trash2 className="size-4" aria-hidden />
            Delete category
          </Button>
        )}
      </Sheet>
      <ConfirmSheet
        isOpen={isConfirmingDelete}
        title={`Delete ${category?.name ?? 'category'}?`}
        confirmLabel="Delete"
        isDanger
        isPending={deleteCategory.isPending}
        onConfirm={confirmDelete}
        onClose={() => setIsConfirmingDelete(false)}
      >
        {category?.itemCount
          ? `Its ${category.itemCount} ${category.itemCount === 1 ? 'item stays' : 'items stay'} in the catalog without a category.`
          : 'No items use it.'}
      </ConfirmSheet>
    </>
  );
}
