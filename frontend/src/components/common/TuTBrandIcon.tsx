import React from 'react';
import { cn } from '@/lib/utils';

interface TuTBrandIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  ringColor?: string;
  letterColor?: string;
}

export function TuTBrandIcon({
  size = 28,
  className,
  ringColor = 'currentColor',
  letterColor = '#F8F5EC',
  ...props
}: TuTBrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="TuT AI Brand Mark"
      className={cn('shrink-0', className)}
      {...props}
    >
      {/* Cartouche ring + base bar: Pale Gold / accent */}
      <g fill="none" stroke={ringColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="28" y="54" width="112" height="72" rx="36" />
        <path d="M150 46V134" />
      </g>
      {/* Letters T u T: Ivory */}
      <g fill="none" stroke={letterColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M46 76H66M56 76V104" />
        <path d="M76 84V94a8 8 0 0 0 16 0V84" />
        <path d="M102 76H122M112 76V104" />
      </g>
    </svg>
  );
}

/** Premium OLED App Icon for TuT AI brand */
export function TuTBrandAvatar({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/tut-brand.png"
      alt="TuT AI Brand"
      width={size}
      height={size}
      className={cn(
        'shrink-0 rounded-2xl object-cover ring-1 ring-border/50 shadow-md bg-black',
        className
      )}
    />
  );
}
