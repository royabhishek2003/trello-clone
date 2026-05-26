import React, { memo } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useDispatch } from 'react-redux';
import { openCardModal } from '../../redux/slices/uiSlice';
import { CardDateBadge } from './CardDateBadge';
import { CheckSquare, Paperclip } from 'lucide-react';
import { getAllChecklistsProgress } from '../../utils/checklistUtils';
import { MemberAvatar } from '../ui/MemberAvatar';

export const CardItem = memo(({ card, index }) => {
  const dispatch = useDispatch();
  const { percentage, completedCount, totalCount } = getAllChecklistsProgress(card.checklists);
  const showChecklistBadge = totalCount > 0;
  const checklistBadgeColor = percentage === 100 ? 'bg-green-600 text-white' : 'text-muted-foreground hover:bg-hover-bg hover:text-foreground';

  const members = card.cardMembers || [];
  const MAX_MEMBERS_VISIBLE = 3;
  const visibleMembers = members.slice(0, MAX_MEMBERS_VISIBLE);
  const remainingMembersCount = members.length - MAX_MEMBERS_VISIBLE;

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          style={provided.draggableProps.style}
          className={`shrink-0 touch-manipulation mb-2 ${snapshot.isDragging ? 'z-50' : ''}`}
        >
          <div
            onClick={() => dispatch(openCardModal(card))}
            role="button"
            className={`border-2 flex flex-col text-sm bg-card text-card-foreground rounded-md overflow-hidden ${
              snapshot.isDragging 
                ? 'border-primary shadow-xl rotate-3 scale-105 cursor-grabbing' 
                : 'border-transparent hover:border-primary focus:border-primary shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all duration-200 hover:-translate-y-[1px] cursor-grab'
            }`}
          >
          {(card.coverUrl || card.coverColor) && (
            <div className={`w-full max-h-[260px] shrink-0 flex overflow-hidden border-b border-border ${!card.coverUrl && card.coverColor ? 'h-8 ' + (card.coverColor === 'green' ? 'bg-green-600' : card.coverColor === 'yellow' ? 'bg-yellow-500' : card.coverColor === 'orange' ? 'bg-orange-500' : card.coverColor === 'red' ? 'bg-red-600' : card.coverColor === 'purple' ? 'bg-purple-600' : card.coverColor === 'blue' ? 'bg-blue-600' : card.coverColor === 'sky' ? 'bg-sky-500' : card.coverColor === 'pink' ? 'bg-pink-600' : card.coverColor === 'lime' ? 'bg-lime-500' : 'bg-slate-800') : 'bg-muted'}`}>
              {card.coverUrl && <img src={card.coverUrl} alt="Cover" className="w-full object-cover" style={{ maxHeight: '260px' }} />}
            </div>
          )}
          <div className="py-2 px-3 sm:py-2.5 sm:px-3">
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
                      className={`h-2 w-10 rounded-sm ${colorMap[color] || 'bg-muted'}`} 
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
                <div className="flex items-center gap-1 flex-wrap text-muted-foreground">
                  {card.attachments && card.attachments.length > 0 && (
                     <div className="flex items-center gap-x-1 px-1.5 py-0.5 hover:bg-hover-bg hover:text-foreground rounded-sm">
                      <Paperclip className="h-3.5 w-3.5" />
                      <span className="text-xs">{card.attachments.length}</span>
                    </div>
                  )}
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
                        className="w-6 h-6 text-[10px] ring-2 ring-card" 
                      />
                    ))}
                    {remainingMembersCount > 0 && (
                      <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-[10px] font-semibold ring-2 ring-card z-10 shrink-0">
                        +{remainingMembersCount}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        </div>
      )}
    </Draggable>
  );
});

CardItem.displayName = 'CardItem';
