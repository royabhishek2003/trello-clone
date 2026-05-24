import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X } from 'lucide-react';

export const ChecklistPopover = ({ children, onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('Checklist');

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title);
    setTitle('Checklist');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 pt-3 px-4 pb-4 shadow-xl" 
        align="start" 
        side="left" 
        sideOffset={10}
        collisionPadding={20}
        style={{ maxHeight: 'var(--radix-popover-content-available-height)' }}
      >
        <div className="relative flex items-center justify-center pb-2 mb-4 border-b border-border">
          <span className="font-semibold text-sm text-foreground">Add checklist</span>
          <Button
            className="absolute right-0 top-0 h-auto w-auto p-1 text-muted-foreground hover:bg-hover-bg hover:text-foreground"
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-y-3">
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm h-9 bg-input text-foreground border-transparent hover:border-input focus:border-primary"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
            />
          </div>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" 
            onClick={handleAdd}
          >
            Add
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
