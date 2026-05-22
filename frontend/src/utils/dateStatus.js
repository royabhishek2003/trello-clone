import { differenceInHours, isPast } from 'date-fns';

export const getCardDateStatus = (dueDate, isDateComplete) => {
  if (!dueDate) return null; // No status if no due date

  if (isDateComplete) {
    return 'complete';
  }

  const due = new Date(dueDate);

  if (isPast(due)) {
    return 'overdue';
  }

  const hoursUntilDue = differenceInHours(due, new Date());
  if (hoursUntilDue >= 0 && hoursUntilDue <= 24) {
    return 'due_soon';
  }

  return 'normal';
};

export const getBadgeColor = (status) => {
  switch (status) {
    case 'complete':
      return 'bg-green-600 text-white';
    case 'overdue':
      return 'bg-red-600 text-white';
    case 'due_soon':
      return 'bg-yellow-500 text-neutral-800';
    case 'normal':
    default:
      return 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300';
  }
};
