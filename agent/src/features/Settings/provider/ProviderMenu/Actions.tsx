import { type MenuProps } from '@mcit-vendor/ui';
import { DropdownMenu } from '@mcit-vendor/ui';
import { ActionIcon } from '@mcit-vendor/ui/base-ui';
import { MoreHorizontalIcon } from 'lucide-react';
import { memo } from 'react';

interface ActionsProps {
  dropdownMenu: MenuProps['items'];
}

const Actions = memo<ActionsProps>(({ dropdownMenu }) => {
  return (
    <DropdownMenu items={dropdownMenu}>
      <ActionIcon icon={MoreHorizontalIcon} size={'small'} style={{ flex: 'none' }} />
    </DropdownMenu>
  );
});

export default Actions;
