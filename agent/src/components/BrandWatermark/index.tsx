'use client';

import { ORG_NAME, UTM_SOURCE } from '@tut/business-const';
import { type FlexboxProps } from '@mcit-vendor/ui';
import { Flexbox } from '@mcit-vendor/ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { memo } from 'react';

import { OFFICIAL_SITE } from '@/const/url';
import { isCustomORG } from '@/const/version';

const styles = createStaticStyles(({ css, cssVar }) => ({
  logoLink: css`
    line-height: 1;
    color: inherit;

    &:hover {
      color: ${cssVar.colorLink};
    }
  `,
}));

const BrandWatermark = memo<Omit<FlexboxProps, 'children'>>(({ style, ...rest }) => {
  return (
    <Flexbox
      horizontal
      align={'center'}
      dir={'ltr'}
      flex={'none'}
      gap={4}
      style={{ color: cssVar.colorTextDescription, fontSize: 12, ...style }}
      {...rest}
    >
      <a
        className={styles.logoLink}
        href="https://mcit.gov.eg"
        rel="noreferrer"
        target="_blank"
      >
        <span style={{ fontWeight: 600 }}>{ORG_NAME}</span>
      </a>
    </Flexbox>
  );
});

export default BrandWatermark;
