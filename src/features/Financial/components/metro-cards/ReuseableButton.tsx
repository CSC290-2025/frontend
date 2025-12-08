import React from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface ReuseableButtonProps {
  icon?: React.ReactNode; // optional icon prop
  text: string; // button text
  className?: string;
  onClick: any;
  spinner?: boolean;
  isPending?: boolean;
  color?: 'blue' | 'cyan' | 'green' | string;
  variant?:
    | 'link'
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | null
    | undefined;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500 hover:bg-blue-600 text-white',
  cyan: 'bg-cyan-400 hover:bg-cyan-500 text-white',
  red: 'bg-red-500 hover:bg-red-300 text-white',
  green: 'bg-green-500 hover:bg-green-600 text-white',
};

export default function ReuseableButton({
  icon,
  text,
  className,
  onClick,
  spinner,
  isPending,
  color,
  variant,
}: ReuseableButtonProps) {
  return (
    <Button //onClick={onCreateNew}
      className={`${color ? colorMap[color] : ''} ${className}`}
      onClick={onClick}
      disabled={isPending}
      variant={variant}
    >
      {spinner && isPending ? (
        <Spinner />
      ) : (
        <>
          {icon && <span className="h-4 w-4">{icon}</span>}
          {text}
        </>
      )}
    </Button>
  );
}
