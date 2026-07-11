import { cn } from '@/lib/utils';

type BadgeVariant = 'blue' | 'teal' | 'grey' | 'green' | 'orange' | 'red';

const variants: Record<BadgeVariant, string> = {
  blue:   'text-[var(--blue)] bg-[var(--blue-light)]',
  teal:   'text-[#007A6E] bg-[var(--teal-light)]',
  grey:   'text-[var(--grey-3)] bg-[var(--grey-1)]',
  green:  'text-[#276749] bg-[#C6F6D5]',
  orange: 'text-[#975A16] bg-[#FEFCBF]',
  red:    'text-[#C53030] bg-[#FED7D7]',
};

export function Badge({ children, variant = 'grey', className }: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold leading-4', variants[variant], className)}>
      {children}
    </span>
  );
}
