import { Center } from '@mcit-vendor/ui';
import { Spin } from '@mcit-vendor/ui/base-ui';
import { cssVar } from 'antd-style';

const VirtuosoLoading = () => {
  return (
    <Center padding={16}>
      <Spin size="small" style={{ color: cssVar.colorTextDescription }} />
    </Center>
  );
};

export default VirtuosoLoading;
