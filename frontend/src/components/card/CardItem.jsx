import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useDispatch } from 'react-redux';
import { openCardModal } from '../../redux/slices/uiSlice';
import { CardDateBadge } from './CardDateBadge';

export const CardItem = ({ card, index }) => {
  const dispatch = useDispatch();

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          onClick={() => dispatch(openCardModal(card))}
          role="button"
          className="border-2 border-transparent hover:border-black py-2 px-3 text-sm bg-white rounded-md shadow-sm"
        >
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {card.labels.map(l => {
                const labelId = l._id || l;
                const color = l.color || null;
                const title = l.title || '';
                
                const colorMap = {
                  green: 'bg-green-600',
                  yellow: 'bg-yellow-500',
                  orange: 'bg-orange-500',
                  red: 'bg-red-600',
                  purple: 'bg-purple-600',
                  blue: 'bg-blue-600',
                  sky: 'bg-sky-500',
                  pink: 'bg-pink-600',
                  lime: 'bg-lime-500',
                  black: 'bg-slate-800',
                };
                
                return (
                  <div 
                    key={labelId} 
                    className={`h-2 w-10 rounded-sm ${colorMap[color] || 'bg-gray-400'}`} 
                    title={title} 
                  />
                );
              })}
            </div>
          )}
          <div className="break-words mb-1">
            {card.title}
          </div>
          {(card.dueDate || card.startDate) && (
            <div className="flex items-center gap-1 flex-wrap">
              <CardDateBadge 
                startDate={card.startDate} 
                dueDate={card.dueDate} 
                hasDueTime={card.hasDueTime} 
                isDateComplete={card.isDateComplete} 
              />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};
