import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none',
        className
      )}
      {...props}
    />
  );
}
