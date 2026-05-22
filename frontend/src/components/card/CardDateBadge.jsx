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
  let badgeColorClass = 'bg-transparent text-neutral-600 hover:bg-neutral-200'; // Default gray
  let iconColor = 'text-neutral-600';

  if (status === 'complete') {
    badgeColorClass = 'bg-green-500 text-white hover:bg-green-600';
    iconColor = 'text-white';
  } else if (status === 'overdue') {
    badgeColorClass = 'bg-red-500 text-white hover:bg-red-600';
    iconColor = 'text-white';
  } else if (status === 'due_soon') {
    badgeColorClass = 'bg-yellow-400 text-neutral-800 hover:bg-yellow-500';
    iconColor = 'text-neutral-800';
  }

  return (
    <div className={`flex items-center gap-x-1 px-1.5 py-0.5 rounded-sm text-xs font-medium ${badgeColorClass}`}>
      <Clock className={`h-3.5 w-3.5 ${iconColor}`} />
      <span>{dateString}</span>
    </div>
  );
};
