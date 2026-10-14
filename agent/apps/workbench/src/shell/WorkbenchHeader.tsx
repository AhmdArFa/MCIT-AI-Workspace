'use client';

import { BRANDING_NAME } from '@tut/business-const';
import { Button } from '@mcit-vendor/ui/base-ui';
import { Flexbox } from '@mcit-vendor/ui/es/Flex/index';
import { createStaticStyles } from 'antd-style';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import WorkbenchBrandLink from './WorkbenchBrandLink';

const styles = createStaticStyles(({ css }) => ({
  cta: css`
    flex: none;
  `,
  title: css`
    flex: 1;
    min-width: 0;
  `,
}));

interface WorkbenchHeaderProps {
  children?: ReactNode;
}

export const WorkbenchHeader = ({ children }: WorkbenchHeaderProps) => {
  const { t } = useTranslation('verify');

  return (
    <Flexbox horizontal align={'center'} gap={8} width={'100%'}>
      <WorkbenchBrandLink />
      <div className={styles.title}>{children}</div>
      <Button className={styles.cta} href={'/'} type={'primary'}>
        {t('actions.goToApp', { name: BRANDING_NAME })}
      </Button>
    </Flexbox>
  );
};
