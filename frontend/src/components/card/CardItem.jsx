import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useDispatch } from 'react-redux';
import { openCardModal } from '../../redux/slices/uiSlice';
import { CardDateBadge } from './CardDateBadge';
import { CheckSquare } from 'lucide-react';
import { getAllChecklistsProgress } from '../../utils/checklistUtils';
import { MemberAvatar } from '../ui/MemberAvatar';

export const CardItem = ({ card, index }) => {
  const dispatch = useDispatch();
  const { percentage, completedCount, totalCount } = getAllChecklistsProgress(card.checklists);
  const showChecklistBadge = totalCount > 0;
  const checklistBadgeColor = percentage === 100 ? 'bg-green-600 text-white' : 'text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700';

  const members = card.cardMembers || [];
  const MAX_MEMBERS_VISIBLE = 3;
  const visibleMembers = members.slice(0, MAX_MEMBERS_VISIBLE);
  const remainingMembersCount = members.length - MAX_MEMBERS_VISIBLE;

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
          {(card.dueDate || card.startDate || showChecklistBadge || members.length > 0) && (
            <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
              <div className="flex items-center gap-1 flex-wrap">
                {(card.dueDate || card.startDate) && (
                  <CardDateBadge 
                    startDate={card.startDate} 
                    dueDate={card.dueDate} 
                    hasDueTime={card.hasDueTime} 
                    isDateComplete={card.isDateComplete} 
                  />
                )}
                {showChecklistBadge && (
                  <div className={`flex items-center gap-x-1 px-1.5 py-0.5 rounded-[4px] text-xs ${checklistBadgeColor}`}>
                    <CheckSquare className="h-3 w-3" />
                    <span>{completedCount}/{totalCount}</span>
                  </div>
                )}
              </div>
              
              {members.length > 0 && (
                <div className="flex items-center -space-x-1 ml-auto">
                  {visibleMembers.map(m => (
                    <MemberAvatar 
                      key={m._id || m} 
                      member={m} 
                      className="w-6 h-6 text-[10px] ring-2 ring-white" 
                    />
                  ))}
                  {remainingMembersCount > 0 && (
                    <div className="w-6 h-6 bg-neutral-200 text-neutral-600 rounded-full flex items-center justify-center text-[10px] font-semibold ring-2 ring-white z-10 shrink-0">
                      +{remainingMembersCount}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};
