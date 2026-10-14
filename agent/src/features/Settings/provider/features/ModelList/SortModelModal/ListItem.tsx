import { Flexbox, SortableList } from '@mcit-vendor/ui';
import { type AiProviderModelListItem } from 'model-bank';
import { memo } from 'react';

import { ModelIcon } from '@/components/TutIcons';

interface ListItemProps extends AiProviderModelListItem {
  disabled?: boolean;
}

const ListItem = memo<ListItemProps>(({ id, displayName, disabled }) => {
  return (
    <>
      <Flexbox horizontal gap={8}>
        <ModelIcon model={id} size={24} type={'avatar'} />
        {displayName || id}
      </Flexbox>
      {!disabled && <SortableList.DragHandle />}
    </>
  );
});

export default ListItem;
