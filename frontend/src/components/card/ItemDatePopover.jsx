import React, { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, ChevronDown } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';

const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  TIME_OPTIONS.push(`${displayH}:00 ${ampm}`);
  TIME_OPTIONS.push(`${displayH}:30 ${ampm}`);
}

export const ItemDatePopover = ({ children, initialDueDate, initialHasTime, onSave, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [enableDueDate, setEnableDueDate] = useState(false);
  
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const timeDropdownRef = useRef(null);

  // Close time dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
        setIsTimeDropdownOpen(false);
      }
    };
    if (isTimeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTimeDropdownOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialDueDate) {
        const d = new Date(initialDueDate);
        setDueDate(format(d, 'M/d/yyyy'));
        setEnableDueDate(true);
        if (initialHasTime) {
          setDueTime(format(d, 'h:mm a'));
        } else {
          setDueTime('');
        }
      } else {
        setDueDate('');
        setDueTime('');
        setEnableDueDate(false);
      }
    }
  }, [isOpen, initialDueDate, initialHasTime]);

  const handleSave = () => {
    if (enableDueDate && dueDate) {
      const parsedDue = new Date(dueDate);
      if (!isNaN(parsedDue)) {
        let hasDueTime = false;
        if (dueTime) {
          const timeMatch = dueTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1], 10);
            const mins = parseInt(timeMatch[2], 10);
            const ampm = timeMatch[3]?.toUpperCase();
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            parsedDue.setHours(hours);
            parsedDue.setMinutes(mins);
          }
          hasDueTime = true;
        }
        onSave(parsedDue.toISOString(), hasDueTime);
      }
    } else {
      onRemove();
    }
    setIsOpen(false);
  };

  const handleRemove = () => {
    onRemove();
    setIsOpen(false);
  };

  const handleCalendarSelect = (date) => {
    setDueDate(format(date, 'M/d/yyyy'));
    setEnableDueDate(true);
  };

  // Keyboard accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <Popover modal={true} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[320px] pt-3 px-4 pb-4 shadow-xl overflow-y-auto scrollbar-thin z-[60]" 
        align="end" 
        side="bottom"
        collisionPadding={20}
        style={{ maxHeight: 'var(--radix-popover-content-available-height)' }}
        onKeyDown={handleKeyDown}
      >
        <div className="relative flex items-center justify-center pb-2 mb-4 border-b border-border">
          <span className="font-semibold text-sm text-foreground">
            Due date
          </span>
          <Button
            className="absolute right-0 top-0 h-auto w-auto p-1 text-muted-foreground hover:bg-hover-bg hover:text-foreground"
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Calendar 
          selectedDate={dueDate ? new Date(dueDate) : null}
          onSelect={handleCalendarSelect}
          className="mb-4"
        />

        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-1.5">
            <label className="text-xs font-bold text-foreground">Due date</label>
            <div className="flex items-center gap-x-2">
              <div 
                className={`w-4 h-4 rounded-sm flex items-center justify-center cursor-pointer transition-colors ${enableDueDate ? 'bg-primary text-primary-foreground' : 'bg-input border-2 border-input'}`}
                onClick={() => {
                  const newState = !enableDueDate;
                  setEnableDueDate(newState);
                  if (newState && !dueDate) {
                    setDueDate(format(new Date(), 'M/d/yyyy'));
                  }
                }}
              >
                {enableDueDate && <span className="text-[10px]">✓</span>}
              </div>
              <Input 
                type="text" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="M/D/YYYY"
                className={`w-28 text-sm h-9 bg-input text-foreground transition-all ${!enableDueDate ? 'opacity-50 cursor-not-allowed border-transparent' : 'border-input focus:border-primary border-primary ring-1 ring-primary'}`}
                disabled={!enableDueDate}
              />
              <div className="relative flex-1" ref={timeDropdownRef}>
                <div onClick={() => enableDueDate && setIsTimeDropdownOpen(!isTimeDropdownOpen)}>
                  <Input 
                    type="text" 
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    placeholder="h:mm a"
                    className={`w-full pr-8 text-sm h-9 bg-input text-foreground transition-opacity cursor-pointer ${!enableDueDate ? 'opacity-50 cursor-not-allowed border-transparent' : 'border-input focus:border-primary'}`}
                    disabled={!enableDueDate}
                    readOnly
                  />
                  <ChevronDown className={`absolute right-2 top-2.5 h-4 w-4 ${!enableDueDate ? 'text-muted-foreground' : 'text-foreground cursor-pointer'}`} />
                </div>
                
                {isTimeDropdownOpen && enableDueDate && (
                  <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-popover border border-border rounded-sm shadow-lg z-50 py-1 scrollbar-thin">
                    {TIME_OPTIONS.map((time, idx) => (
                      <div 
                        key={idx}
                        className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-hover-bg ${time === dueTime ? 'bg-primary/20 text-primary font-medium' : 'text-foreground'}`}
                        onClick={() => {
                          setDueTime(time);
                          setIsTimeDropdownOpen(false);
                        }}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-y-2 mt-2">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={handleSave}>
              Save
            </Button>
            <Button className="w-full bg-muted hover:bg-hover-bg text-foreground font-semibold" onClick={handleRemove}>
              Remove
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
