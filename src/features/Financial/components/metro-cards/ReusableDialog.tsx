import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { ReactNode } from 'react';

interface ReusableDialogProps {
  trigger?: ReactNode;
  triggerLabel?: string;
  triggerVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  title: string;
  description?: string;
  cancelLabel?: string;
  actionLabel?: string;
  onAction?: () => void;
  isPending: boolean;
  className?: string;
  spinner?: boolean;
}

export function ReusableDialog({
  trigger,
  triggerLabel = 'Show Dialog',
  triggerVariant = 'outline',
  title,
  description,
  cancelLabel = 'Cancel',
  actionLabel = 'Continue',
  onAction,
  isPending,
  className,
  spinner = false,
}: ReusableDialogProps) {
  return (
    <AlertDialog>
      {trigger ? (
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      ) : (
        <AlertDialogTrigger asChild>
          <Button variant={triggerVariant}>{triggerLabel}</Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onAction}
            disabled={isPending}
            className={`${className} w-20`}
          >
            {spinner && isPending ? <Spinner /> : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
