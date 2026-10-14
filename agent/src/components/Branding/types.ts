import { type CSSProperties, type ReactNode } from 'react';

/** Props shared by the MCIT AI product logo components. */
export interface BrandLogoProps {
  className?: string;
  color?: string;
  extra?: ReactNode;
  size?: number;
  style?: CSSProperties;
  type?: '3d' | 'flat' | 'mono' | 'text' | 'combine';
}
