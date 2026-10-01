import type { PurchaseRecordDto } from '@shoppy/shared';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { SheetAction } from '@/components/ui/sheet-action';

export type RecordAction = 'restore' | 'readd' | 'delete';

interface HistoryRecordSheetProps {
  record: PurchaseRecordDto | undefined;
  onAction: (record: PurchaseRecordDto, action: RecordAction) => void;
  onClose: () => void;
}

export function HistoryRecordSheet({ record, onAction, onClose }: HistoryRecordSheetProps) {
  return (
    <Sheet isOpen={record !== undefined} onClose={onClose} title={record?.name ?? ''}>
      {record && (
        <div className="-mx-1 flex flex-col">
          <SheetAction
            icon={RotateCcw}
            label="Put back on the list"
            onClick={() => onAction(record, 'restore')}
          />
          <SheetAction
            icon={Plus}
            label="Add to the list again"
            onClick={() => onAction(record, 'readd')}
          />
          <SheetAction
            icon={Trash2}
            label="Delete from history"
            isDanger
            onClick={() => onAction(record, 'delete')}
          />
        </div>
      )}
    </Sheet>
  );
}
