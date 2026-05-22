import { format } from 'date-fns';

export const formatCardDate = (startDate, dueDate, hasDueTime) => {
  if (!startDate && !dueDate) return '';

  const formatStr = hasDueTime ? 'MMM d, h:mm a' : 'MMM d';
  
  if (startDate && dueDate) {
    const startStr = format(new Date(startDate), 'MMM d');
    const dueStr = format(new Date(dueDate), formatStr);
    return `${startStr} - ${dueStr}`;
  }
  
  if (dueDate) {
    return format(new Date(dueDate), formatStr);
  }
  
  if (startDate) {
    return `Starts ${format(new Date(startDate), 'MMM d')}`;
  }

  return '';
};
