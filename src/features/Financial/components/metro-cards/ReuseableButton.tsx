import React from 'react';
import { Button } from '@/components/ui/button';

interface ReuseableButtonProps {
  icon?: React.ReactNode; // optional icon prop
  text: string; // button text
  className?: string;
  onClick: () => void;
}

export default function ReuseableButton({
  icon,
  text,
  className,
  onClick,
}: ReuseableButtonProps) {
  return (
    <Button //onClick={onCreateNew}
      className={`bg-cyan-400 text-white hover:bg-cyan-500 ${className}`}
      onClick={onClick}
    >
      {icon && <span className="h-4 w-4">{icon}</span>}
      {text}
    </Button>
  );
}
