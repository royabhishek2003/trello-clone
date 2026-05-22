import React from 'react';
import { Clock } from 'lucide-react';
import { formatCardDate } from '../../utils/formatCardDate';
import { getCardDateStatus, getBadgeColor } from '../../utils/dateStatus';

export const CardDateBadge = ({ startDate, dueDate, hasDueTime, isDateComplete }) => {
  if (!dueDate && !startDate) return null;

  // On the board, if only start date exists, we don't show a badge in standard Trello usually, 
  // but if both exist we show range or just due date depending on space.
  // We'll just show the formatted date. If there is no due date, we just show start date.
  const dateString = formatCardDate(startDate, dueDate, false); // false for hasDueTime to keep badge small on board

  const status = getCardDateStatus(dueDate, isDateComplete);
  
  // Trello applies specific styling for badges
  let badgeColorClass = 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'; // Default gray pill
  let iconColor = 'text-neutral-700';

  if (status === 'complete') {
    badgeColorClass = 'bg-green-600 text-white hover:bg-green-700';
    iconColor = 'text-white';
  } else if (status === 'overdue') {
    badgeColorClass = 'bg-[#ca3521] text-white hover:bg-red-700'; // Trello's distinctive overdue red
    iconColor = 'text-white';
  } else if (status === 'due_soon') {
    badgeColorClass = 'bg-[#f5d232] text-neutral-800 hover:bg-yellow-500'; // Bright Trello yellow
    iconColor = 'text-neutral-800';
  }

  return (
    <div className={`flex items-center gap-x-1 px-2 py-0.5 rounded-[14px] text-[13px] font-semibold ${badgeColorClass} transition-colors`}>
      <Clock className={`h-3.5 w-3.5 ${iconColor}`} />
      <span>{dateString}</span>
    </div>
  );
};
