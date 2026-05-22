import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';

export const SortableBoard = ({ board }) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: board._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.5 : 1,
    backgroundImage: `url(${board.imageThumbUrl || board.imageFullUrl})`
  };

  const handleClick = (e) => {
    // If we're dragging, prevent click
    if (isDragging) {
      e.preventDefault();
      return;
    }
    navigate(`/board/${board._id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="group relative aspect-video bg-no-repeat bg-center bg-cover bg-sky-700 rounded-sm h-full w-full p-2 overflow-hidden cursor-pointer shadow-sm hover:shadow-md"
    >
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
      <p className="relative font-semibold text-white">
        {board.title}
      </p>
    </div>
  );
};
