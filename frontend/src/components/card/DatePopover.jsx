import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, ChevronDown } from 'lucide-react';
import { updateCard } from '../../redux/slices/cardSlice';
import { fetchLists } from '../../redux/slices/listSlice';
import { Calendar } from '../ui/calendar';
import { format, parse } from 'date-fns';

const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  TIME_OPTIONS.push(`${displayH}:00 ${ampm}`);
  TIME_OPTIONS.push(`${displayH}:30 ${ampm}`);
}

export const DatePopover = ({ children }) => {
  const dispatch = useDispatch();
  const { cardData } = useSelector(state => state.ui);
  const { currentBoard } = useSelector(state => state.boards);

  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [enableStartDate, setEnableStartDate] = useState(false);
  const [enableDueDate, setEnableDueDate] = useState(false);
  
  // Track which field the calendar is currently editing
  const [activeField, setActiveField] = useState('dueDate');
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
    if (isOpen && cardData) {
      if (cardData.startDate) {
        setStartDate(format(new Date(cardData.startDate), 'M/d/yyyy'));
        setEnableStartDate(true);
      } else {
        setStartDate('');
        setEnableStartDate(false);
      }

      if (cardData.dueDate) {
        const d = new Date(cardData.dueDate);
        setDueDate(format(d, 'M/d/yyyy'));
        setEnableDueDate(true);
        if (cardData.hasDueTime) {
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
  }, [isOpen, cardData]);

  const handleSave = async () => {
    const updatePayload = {};

    if (enableStartDate && startDate) {
      const parsedStart = new Date(startDate);
      if (!isNaN(parsedStart)) {
        updatePayload.startDate = parsedStart.toISOString();
      }
    } else {
      updatePayload.startDate = null;
    }

    if (enableDueDate && dueDate) {
      const parsedDue = new Date(dueDate);
      if (!isNaN(parsedDue)) {
        if (dueTime) {
          // simple parse for h:mm a
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
          updatePayload.hasDueTime = true;
        } else {
          updatePayload.hasDueTime = false;
        }
        updatePayload.dueDate = parsedDue.toISOString();
      }
    } else {
      updatePayload.dueDate = null;
      updatePayload.hasDueTime = false;
      updatePayload.isDateComplete = false;
    }

    await dispatch(updateCard({ id: cardData._id, data: updatePayload }));
    if (currentBoard?._id) {
      dispatch(fetchLists(currentBoard._id));
    }
    setIsOpen(false);
  };

  const handleRemove = async () => {
    await dispatch(updateCard({ 
      id: cardData._id, 
      data: { startDate: null, dueDate: null, isDateComplete: false, hasDueTime: false } 
    }));
    if (currentBoard?._id) {
      dispatch(fetchLists(currentBoard._id));
    }
    setIsOpen(false);
  };

  const handleCalendarSelect = (date) => {
    const dateString = format(date, 'M/d/yyyy');
    if (activeField === 'startDate') {
      setStartDate(dateString);
      setEnableStartDate(true);
    } else {
      setDueDate(dateString);
      setEnableDueDate(true);
    }
  };

  return (
    <Popover modal={true} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[320px] pt-3 px-4 pb-4 shadow-xl overflow-y-auto scrollbar-thin z-[60]" 
        align="start" 
        side="left" 
        sideOffset={10}
        collisionPadding={20}
        style={{ maxHeight: 'var(--radix-popover-content-available-height)' }}
      >
        <div className="relative flex items-center justify-center pb-2 mb-4 border-b border-border">
          <span className="font-semibold text-sm text-foreground">
            Dates
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
          selectedDate={activeField === 'startDate' && startDate ? new Date(startDate) : (activeField === 'dueDate' && dueDate ? new Date(dueDate) : null)}
          onSelect={handleCalendarSelect}
          className="mb-4"
        />

        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-1.5">
            <label className="text-xs font-bold text-foreground">Start date</label>
            <div className="flex items-center gap-x-2">
              <div 
                className={`w-4 h-4 rounded-sm flex items-center justify-center cursor-pointer transition-colors ${enableStartDate ? 'bg-primary text-primary-foreground' : 'bg-input border-2 border-input'}`}
                onClick={() => {
                  const newState = !enableStartDate;
                  setEnableStartDate(newState);
                  if (newState && !startDate) {
                    setStartDate(format(new Date(), 'M/d/yyyy'));
                  }
                  setActiveField('startDate');
                }}
              >
                {enableStartDate && <span className="text-[10px]">✓</span>}
              </div>
              <Input 
                type="text" 
                value={startDate}
                onFocus={() => setActiveField('startDate')}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="M/D/YYYY"
                className={`text-sm h-9 bg-input text-foreground transition-all ${!enableStartDate ? 'opacity-50 cursor-not-allowed border-transparent' : 'border-input focus:border-primary'} ${activeField === 'startDate' ? 'border-primary ring-1 ring-primary' : ''}`}
                disabled={!enableStartDate}
              />
            </div>
          </div>

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
                  setActiveField('dueDate');
                }}
              >
                {enableDueDate && <span className="text-[10px]">✓</span>}
              </div>
              <Input 
                type="text" 
                value={dueDate}
                onFocus={() => setActiveField('dueDate')}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="M/D/YYYY"
                className={`w-28 text-sm h-9 bg-input text-foreground transition-all ${!enableDueDate ? 'opacity-50 cursor-not-allowed border-transparent' : 'border-input focus:border-primary'} ${activeField === 'dueDate' ? 'border-primary ring-1 ring-primary' : ''}`}
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

          <div className="bg-muted p-2 text-xs text-muted-foreground rounded-sm mb-1 mt-1 leading-relaxed">
            Reminders will be sent to all members and watchers of this card.
          </div>

          <div className="flex flex-col gap-y-2">
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
