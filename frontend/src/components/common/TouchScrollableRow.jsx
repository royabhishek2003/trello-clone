import React, { forwardRef } from 'react';

export const TouchScrollableRow = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div 
      ref={ref}
      className={`flex h-full w-full overflow-x-auto overflow-y-hidden snap-x-mandatory scrollbar-hide touch-pan-x ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

TouchScrollableRow.displayName = 'TouchScrollableRow';
