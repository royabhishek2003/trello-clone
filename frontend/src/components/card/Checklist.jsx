import React, { useState, useRef, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { CheckSquare, Trash } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ChecklistItem } from './ChecklistItem';
import { getChecklistProgress } from '../../utils/checklistUtils';

export const Checklist = ({ checklist, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(checklist.title);
  const [hideCompleted, setHideCompleted] = useState(false);
  
  const addInputRef = useRef(null);

  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAdding]);

  const { percentage, completedCount, totalCount } = getChecklistProgress(checklist);

  const handleAddItem = () => {
    if (!newItemText.trim()) {
      setIsAdding(false);
      return;
    }
    const generateObjectId = () => [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const newItem = {
      _id: generateObjectId(),
      text: newItemText,
      isCompleted: false,
      position: checklist.items ? checklist.items.length : 0
    };
    
    onUpdate({
      ...checklist,
      items: [...(checklist.items || []), newItem]
    });
    setNewItemText('');
  };

  const handleUpdateItem = (updatedItem) => {
    const newItems = checklist.items.map(item => 
      item._id === updatedItem._id ? updatedItem : item
    );
    onUpdate({ ...checklist, items: newItems });
  };

  const handleDeleteItem = (itemId) => {
    const newItems = checklist.items.filter(item => item._id !== itemId);
    onUpdate({ ...checklist, items: newItems });
  };

  const handleSaveTitle = () => {
    if (title.trim() && title !== checklist.title) {
      onUpdate({ ...checklist, title });
    } else {
      setTitle(checklist.title);
    }
    setIsEditingTitle(false);
  };

  const visibleItems = hideCompleted 
    ? (checklist.items || []).filter(i => !i.isCompleted)
    : (checklist.items || []);

  return (
    <div className="w-full mb-8">
      {/* Header */}
      <div className="flex items-start justify-between w-full mb-4">
        <div className="flex items-center gap-x-3 flex-1 min-w-0">
          <CheckSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          {isEditingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
              }}
              autoFocus
              className="font-semibold text-lg px-1 text-foreground h-8 flex-1 focus-visible:bg-input focus-visible:border-primary"
            />
          ) : (
            <div 
              onClick={() => setIsEditingTitle(true)}
              className="font-semibold text-lg cursor-pointer hover:bg-hover-bg py-0.5 px-1 rounded-sm break-words flex-1 min-w-0 text-foreground"
            >
              {checklist.title}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-x-2 ml-4 flex-shrink-0">
          {completedCount > 0 && (
            <Button 
              variant="gray" 
              className="h-8 text-xs font-semibold px-3 hidden sm:flex"
              onClick={() => setHideCompleted(!hideCompleted)}
            >
              {hideCompleted ? 'Show checked items' : 'Hide checked items'}
            </Button>
          )}
          <Button 
            variant="gray" 
            className="h-8 text-xs font-semibold px-3"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-x-3 mb-4 w-full">
        <div className="text-xs text-muted-foreground font-medium w-8 text-right">
          {percentage}%
        </div>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${percentage === 100 ? 'bg-green-600' : 'bg-primary'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Items Droppable Area */}
      <Droppable droppableId={`checklist-${checklist._id}`} type="CHECKLIST_ITEM">
        {(provided) => (
          <div 
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex flex-col mb-2 pl-8"
          >
            {visibleItems.map((item, index) => (
              <ChecklistItem 
                key={item._id} 
                item={item} 
                index={index}
                onUpdate={handleUpdateItem}
                onDelete={() => handleDeleteItem(item._id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Item Button */}
      <div className="pl-8 mt-2">
        {!isAdding ? (
          <Button 
            variant="gray" 
            className="h-8 px-3 font-semibold text-sm"
            onClick={() => setIsAdding(true)}
          >
            Add an item
          </Button>
        ) : (
          <div className="flex flex-col gap-y-2 mt-1">
            <Input
              ref={addInputRef}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Add an item"
              className="h-9 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddItem();
                }
              }}
            />
            <div className="flex items-center gap-x-2">
              <Button onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Add
              </Button>
              <Button variant="ghost" onClick={() => {
                setIsAdding(false);
                setNewItemText('');
              }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
