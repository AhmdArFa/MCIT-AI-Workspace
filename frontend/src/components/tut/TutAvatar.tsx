import { cn } from '@/lib/utils'

/** TuT Agent's identity: Tutankhamun, the default avatar. */
export function TutAvatar({ size = 40, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/avatars/mcit/tutankhamun.webp"
      alt="TuT Agent"
      width={size}
      height={size}
      onError={(e) => {
        const target = e.currentTarget;
        if (!target.src.endsWith('/avatars/tutankhamun.webp')) {
          target.src = '/avatars/tutankhamun.webp';
        }
      }}
      className={cn('shrink-0 rounded-full object-cover ring-1 ring-border', className)}
    />
  )
}
