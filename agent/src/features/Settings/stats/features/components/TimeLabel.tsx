import { Flexbox, Icon } from '@mcit-vendor/ui';
import { Spin } from '@mcit-vendor/ui/base-ui';
import { cssVar } from 'antd-style';
import { type LucideIcon } from 'lucide-react';
import { memo } from 'react';

const TimeLabel = memo<{
  date?: string;
  icon: LucideIcon;
  /** Omit when the icon already says what the value is. */
  title?: string;
}>(({ date, icon, title }) => {
  return (
    <Flexbox
      horizontal
      align={'center'}
      gap={4}
      style={{
        color: cssVar.colorTextDescription,
        fontSize: 12,
      }}
    >
      <Icon icon={icon} />
      {title ? `${title}: ` : null}
      {date ? <span style={{ fontWeight: 'bold' }}>{date}</span> : <Spin size="small" />}
    </Flexbox>
  );
});

export default TimeLabel;
