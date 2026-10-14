import { ORG_NAME } from '@tut/business-const';
import { type BrandLogoProps } from '../types';
import { memo } from 'react';

export const OrgBrand = memo<BrandLogoProps>(() => {
  return <span>{ORG_NAME}</span>;
});
