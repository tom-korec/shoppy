import type { MemberDto, Permission, Role } from '@shoppy/shared';
import { Sheet } from '@/components/ui/sheet';
import { MemberEditor } from './member-editor';

interface MemberSheetProps {
  member: MemberDto | undefined;
  myRole: Role;
  myPermissions: readonly Permission[];
  onClose: () => void;
}

export function MemberSheet({ member, myRole, myPermissions, onClose }: MemberSheetProps) {
  return (
    <Sheet isOpen={member !== undefined} onClose={onClose} title={member?.displayName ?? ''}>
      {member && (
        <MemberEditor
          key={member.id}
          member={member}
          myRole={myRole}
          myPermissions={myPermissions}
          onClose={onClose}
        />
      )}
    </Sheet>
  );
}
