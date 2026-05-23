import React from 'react';

export const ResponsiveBoardShell = ({ children, header, sidebar }) => {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Sidebar - injected here but likely hidden on mobile natively or rendered in a drawer */}
      {sidebar}
      
      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden min-w-0">
        {header}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};
