import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useDispatch } from 'react-redux';
import { openCardModal } from '../../redux/slices/uiSlice';

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
          className="truncate border-2 border-transparent hover:border-black py-2 px-3 text-sm bg-white rounded-md shadow-sm"
        >
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {card.labels.map(l => {
                const label = typeof l === 'object' ? l : null;
                if (!label) return null;
                // mapping standard colors to bg colors
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
                  <div key={label._id} className={`h-2 w-10 rounded-full ${colorMap[label.color] || 'bg-gray-500'}`} title={label.title} />
                );
              })}
            </div>
          )}
          {card.title}
        </div>
      )}
    </Draggable>
  );
};
