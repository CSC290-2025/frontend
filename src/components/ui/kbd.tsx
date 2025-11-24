import { cn } from '@/lib/utils';

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center rounded border border-gray-400 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm',
        className
      )}
    >
      {children}
    </kbd>
  );
}
