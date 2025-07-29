
import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
       <div
        className={cn(
          "relative rounded-md before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-r before:from-primary/50 before:to-primary before:opacity-0 before:transition-opacity before:duration-300 focus-within:before:opacity-100"
        )}
      >
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-within:border-transparent' // Hide the standard border when gradient is active
            , className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
