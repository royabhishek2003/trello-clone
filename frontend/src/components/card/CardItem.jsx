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
          {card.title}
        </div>
      )}
    </Draggable>
  );
};
