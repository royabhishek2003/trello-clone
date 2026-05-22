export const matchesCardFilters = (card, filters, currentUserId) => {
  const { labels, members, due } = filters;

  // If no filters are active, it's a match
  if (labels.length === 0 && members.length === 0 && due.length === 0) {
    return true;
  }

  let matchesLabels = true;
  if (labels.length > 0) {
    // Normalizing ObjectId / string conversions
    const cardLabelIds = card.labels ? card.labels.map(l => typeof l === 'object' ? String(l._id) : String(l)) : [];
    matchesLabels = cardLabelIds.some(id => labels.includes(id));
  }

  let matchesMembers = true;
  if (members.length > 0) {
    const cardMemberIds = card.cardMembers ? card.cardMembers.map(m => typeof m === 'object' ? String(m._id) : String(m)) : [];
    matchesMembers = cardMemberIds.some(id => members.includes(id));
  }

  let matchesDue = true;
  if (due.length > 0) {
    matchesDue = false; // Need to match at least one due date condition
    const now = new Date();
    const dueDate = card.dueDate ? new Date(card.dueDate) : null;
    const isDateComplete = !!card.isDateComplete;

    if (due.includes('noDate') && !dueDate) {
      matchesDue = true;
    }

    if (dueDate) {
      if (due.includes('completed') && isDateComplete) {
        matchesDue = true;
      }
      if (due.includes('notCompleted') && !isDateComplete) {
        matchesDue = true;
      }
      
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      if (due.includes('overdue') && dueDate < now && !isDateComplete) {
        matchesDue = true;
      }
      if (due.includes('today') && dueDate >= now && dueDate < tomorrow && !isDateComplete) {
        matchesDue = true;
      }
      if (due.includes('thisWeek') && dueDate >= now && dueDate < nextWeek && !isDateComplete) {
        matchesDue = true;
      }
    }
  }

  // Trello combines Label, Member, and Due filters with AND logic across types,
  // but OR logic within the same type (e.g. Label A OR Label B) AND (Member A OR Member B).
  // This matches exactly how our boolean flags above operate.
  
  // If a filter type is active (length > 0) but it doesn't match, the card fails.
  if (labels.length > 0 && !matchesLabels) return false;
  if (members.length > 0 && !matchesMembers) return false;
  if (due.length > 0 && !matchesDue) return false;

  return true;
};
