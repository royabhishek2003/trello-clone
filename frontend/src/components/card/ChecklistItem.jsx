import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Trash, Clock } from 'lucide-react';
import { Input } from '../ui/input';
import { ItemDatePopover } from './ItemDatePopover';
import { CardDateBadge } from './CardDateBadge';

export const ChecklistItem = ({ item, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (text.trim() && text !== item.text) {
      onUpdate({ ...item, text });
    } else if (!text.trim()) {
      setText(item.text);
    }
    setIsEditing(false);
  };

  const toggleComplete = () => {
    onUpdate({ ...item, isCompleted: !item.isCompleted });
  };

  const handleSaveDate = (dueDate, hasDueTime) => {
    onUpdate({ ...item, dueDate, hasDueTime });
  };

  const handleRemoveDate = () => {
    onUpdate({ ...item, dueDate: null, hasDueTime: false });
  };

  return (
    <Draggable draggableId={item._id || `item-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group flex items-start gap-x-3 py-1.5 ${snapshot.isDragging ? 'opacity-50' : ''}`}
        >
          <div className="mt-1 flex-shrink-0">
            <input
              type="checkbox"
              checked={item.isCompleted}
              onChange={toggleComplete}
              className="w-4 h-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col gap-y-1">
            {isEditing ? (
              <Input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
                className="h-8 text-sm bg-white"
              />
            ) : (
              <div 
                onClick={() => setIsEditing(true)}
                className={`text-sm py-1 px-1 cursor-pointer rounded-sm hover:bg-neutral-200 min-h-[32px] break-words ${item.isCompleted ? 'line-through text-neutral-500' : 'text-neutral-700'}`}
              >
                {item.text}
              </div>
            )}
            
            {/* Date Badge */}
            {item.dueDate && !isEditing && (
              <div className="flex items-center" title={new Date(item.dueDate).toLocaleString()}>
                <ItemDatePopover
                  initialDueDate={item.dueDate}
                  initialHasTime={item.hasDueTime}
                  onSave={handleSaveDate}
                  onRemove={handleRemoveDate}
                >
                  <div role="button" className="cursor-pointer">
                    <CardDateBadge 
                      startDate={null} 
                      dueDate={item.dueDate} 
                      hasDueTime={item.hasDueTime} 
                      isDateComplete={item.isCompleted} 
                    />
                  </div>
                </ItemDatePopover>
              </div>
            )}
          </div>
          
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
            <ItemDatePopover
              initialDueDate={item.dueDate}
              initialHasTime={item.hasDueTime}
              onSave={handleSaveDate}
              onRemove={handleRemoveDate}
            >
              <div 
                role="button"
                className="flex-shrink-0 h-8 w-8 rounded-sm flex items-center justify-center hover:bg-neutral-200 cursor-pointer text-neutral-500 mr-1"
                title="Set due date"
              >
                <Clock className="h-4 w-4" />
              </div>
            </ItemDatePopover>

            <div 
              role="button"
              onClick={onDelete}
              className="flex-shrink-0 h-8 w-8 rounded-sm flex items-center justify-center hover:bg-neutral-200 cursor-pointer text-neutral-500"
              title="Delete item"
            >
              <Trash className="h-4 w-4" />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
