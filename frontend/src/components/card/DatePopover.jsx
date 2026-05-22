import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X } from 'lucide-react';
import { updateCard } from '../../redux/slices/cardSlice';
import { fetchLists } from '../../redux/slices/listSlice';

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

  useEffect(() => {
    if (isOpen && cardData) {
      if (cardData.startDate) {
        setStartDate(new Date(cardData.startDate).toISOString().split('T')[0]);
        setEnableStartDate(true);
      } else {
        setStartDate('');
        setEnableStartDate(false);
      }

      if (cardData.dueDate) {
        const d = new Date(cardData.dueDate);
        setDueDate(d.toISOString().split('T')[0]);
        setEnableDueDate(true);
        if (cardData.hasDueTime) {
          setDueTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
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
      updatePayload.startDate = new Date(startDate).toISOString();
    } else {
      updatePayload.startDate = null;
    }

    if (enableDueDate && dueDate) {
      const dateObj = new Date(dueDate);
      if (dueTime) {
        const [hours, minutes] = dueTime.split(':');
        dateObj.setHours(parseInt(hours, 10));
        dateObj.setMinutes(parseInt(minutes, 10));
        updatePayload.hasDueTime = true;
      } else {
        updatePayload.hasDueTime = false;
      }
      updatePayload.dueDate = dateObj.toISOString();
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

  return (
    <Popover modal={true} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[320px] pt-3 px-4 pb-4" align="start" side="bottom">
        <div className="relative flex items-center justify-center pb-2 mb-4 border-b">
          <span className="font-semibold text-sm text-neutral-700">
            Dates
          </span>
          <Button
            className="absolute right-0 top-0 h-auto w-auto p-1 text-neutral-600"
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-2">
              <input 
                type="checkbox" 
                className="w-3.5 h-3.5 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                checked={enableStartDate}
                onChange={(e) => {
                  setEnableStartDate(e.target.checked);
                  if (e.target.checked && !startDate) {
                    setStartDate(new Date().toISOString().split('T')[0]);
                  }
                }}
              />
              <label className="text-xs font-semibold text-neutral-700">Start date</label>
            </div>
            <Input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`text-sm h-9 bg-neutral-100 border-none transition-opacity ${!enableStartDate ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!enableStartDate}
            />
          </div>

          <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-2">
              <input 
                type="checkbox" 
                className="w-3.5 h-3.5 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                checked={enableDueDate}
                onChange={(e) => {
                  setEnableDueDate(e.target.checked);
                  if (e.target.checked && !dueDate) {
                    setDueDate(new Date().toISOString().split('T')[0]);
                  }
                }}
              />
              <label className="text-xs font-semibold text-neutral-700">Due date</label>
            </div>
            <div className="flex gap-x-2">
              <Input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`flex-1 text-sm h-9 bg-neutral-100 border-none transition-opacity ${!enableDueDate ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!enableDueDate}
              />
              <Input 
                type="time" 
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className={`w-24 text-sm h-9 bg-neutral-100 border-none transition-opacity ${!enableDueDate ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!enableDueDate}
              />
            </div>
          </div>

          <div className="bg-neutral-100 p-2 text-xs text-neutral-600 rounded-sm mb-1 mt-1">
            Reminders will be sent to all members and watchers of this card.
          </div>

          <div className="flex flex-col gap-y-2">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-none" onClick={handleSave}>
              Save
            </Button>
            <Button className="w-full bg-neutral-200 hover:bg-neutral-300 text-neutral-800 shadow-none" onClick={handleRemove}>
              Remove
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
