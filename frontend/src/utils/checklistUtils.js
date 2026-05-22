export const getChecklistProgress = (checklist) => {
  if (!checklist || !checklist.items || checklist.items.length === 0) {
    return { percentage: 0, completedCount: 0, totalCount: 0 };
  }

  const totalCount = checklist.items.length;
  const completedCount = checklist.items.filter(item => item.isCompleted).length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return { percentage, completedCount, totalCount };
};

export const getAllChecklistsProgress = (checklists) => {
  if (!checklists || checklists.length === 0) {
    return { percentage: 0, completedCount: 0, totalCount: 0 };
  }

  const allItems = checklists.reduce((acc, curr) => acc.concat(curr.items || []), []);
  
  if (allItems.length === 0) {
    return { percentage: 0, completedCount: 0, totalCount: 0 };
  }

  const totalCount = allItems.length;
  const completedCount = allItems.filter(item => item.isCompleted).length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return { percentage, completedCount, totalCount };
};
