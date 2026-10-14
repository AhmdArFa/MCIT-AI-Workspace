'use client';

import { type BrandLogoProps } from '../types';
import { memo } from 'react';

import CustomLogo from './Custom';

interface ProductLogoProps extends BrandLogoProps {
  height?: number;
  width?: number;
}

export const ProductLogo = memo<ProductLogoProps>((props) => {
  return <CustomLogo {...props} />;
});
