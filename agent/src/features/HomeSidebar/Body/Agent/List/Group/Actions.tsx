import { type MenuProps } from '@mcit-vendor/ui';
import { DropdownMenu } from '@mcit-vendor/ui';
import { ActionIcon } from '@mcit-vendor/ui/base-ui';
import { MoreHorizontalIcon } from 'lucide-react';
import { memo } from 'react';

interface ActionsProps {
  dropdownMenu: MenuProps['items'];
  isLoading?: boolean;
}

const Actions = memo<ActionsProps>(({ dropdownMenu, isLoading }) => {
  return (
    <DropdownMenu items={dropdownMenu}>
      <ActionIcon
        icon={MoreHorizontalIcon}
        loading={isLoading}
        size={'small'}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    </DropdownMenu>
  );
});

export default Actions;
