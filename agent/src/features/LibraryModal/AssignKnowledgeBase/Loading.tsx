import { Flexbox } from '@mcit-vendor/ui';
import { Skeleton } from '@mcit-vendor/ui/base-ui';

const Loading = () => {
  return (
    <Flexbox>
      <Skeleton.Text rows={8} />
    </Flexbox>
  );
};

export default Loading;
