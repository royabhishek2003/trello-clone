import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Filter, X, Check, Clock, User, Tag } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { toggleFilter, clearFilters } from '../../redux/slices/listSlice';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export const BoardFilterPopover = () => {
  const dispatch = useDispatch();
  
  const { lists, filters } = useSelector(state => state.lists);
  const { labels } = useSelector(state => state.labels);
  const { user } = useSelector(state => state.auth);

  // Derive unique members from all cards in the board
  const boardMembers = useMemo(() => {
    const memberMap = new Map();
    lists.forEach(list => {
      list.cards?.forEach(card => {
        card.cardMembers?.forEach(member => {
          if (!memberMap.has(member._id)) {
            memberMap.set(member._id, member);
          }
        });
      });
    });
    return Array.from(memberMap.values());
  }, [lists]);

  const activeFilterCount = filters.labels.length + filters.members.length + filters.due.length;

  const dueOptions = [
    { id: 'noDate', label: 'No dates', color: 'bg-slate-200' },
    { id: 'overdue', label: 'Overdue', color: 'bg-red-500 text-white' },
    { id: 'today', label: 'Due today', color: 'bg-yellow-500 text-white' },
    { id: 'thisWeek', label: 'Due this week', color: 'bg-sky-500 text-white' },
    { id: 'completed', label: 'Marked as complete', color: 'bg-green-500 text-white' },
    { id: 'notCompleted', label: 'Not marked as complete', color: 'bg-slate-300' },
  ];

  const handleToggle = (type, id) => {
    dispatch(toggleFilter({ type, id }));
  };

  const handleClearAll = () => {
    dispatch(clearFilters());
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="transparent" 
          className={`h-auto w-auto p-2 font-medium flex items-center gap-x-2 ${activeFilterCount > 0 ? 'bg-sky-500/20 text-sky-100 hover:bg-sky-500/30' : ''}`}
        >
          <Filter className="h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <span className="bg-sky-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 shadow-xl" align="end" sideOffset={10}>
        <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
          <span className="font-semibold text-sm text-foreground">Filter</span>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-auto py-1 px-2 text-xs text-sky-600 hover:text-sky-700 hover:bg-sky-50">
              Clear all
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
          
          {/* Members */}
          <div className="flex flex-col gap-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-x-2">
              <User className="h-3 w-3" /> Members
            </h4>
            <div className="flex flex-col gap-y-1">
              {user && (
                <div 
                  className="flex items-center gap-x-2 p-1.5 rounded-md hover:bg-hover-bg cursor-pointer"
                  onClick={() => handleToggle('members', user._id)}
                >
                  <div className={`h-4 w-4 border rounded-sm flex items-center justify-center ${filters.members.includes(user._id) ? 'bg-sky-600 border-sky-600' : 'border-input'}`}>
                    {filters.members.includes(user._id) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback className="text-[10px]">{user.firstName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Cards assigned to me</span>
                </div>
              )}
              
              {boardMembers.filter(m => m._id !== user?._id).map(member => {
                const isSelected = filters.members.includes(member._id);
                return (
                  <div 
                    key={member._id}
                    className="flex items-center gap-x-2 p-1.5 rounded-md hover:bg-hover-bg cursor-pointer"
                    onClick={() => handleToggle('members', member._id)}
                  >
                    <div className={`h-4 w-4 border rounded-sm flex items-center justify-center ${isSelected ? 'bg-sky-600 border-sky-600' : 'border-input'}`}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.imageUrl} />
                      <AvatarFallback className="text-[10px]">{member.firstName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate">{member.firstName} {member.lastName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Due Dates */}
          <div className="flex flex-col gap-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-x-2">
              <Clock className="h-3 w-3" /> Due date
            </h4>
            <div className="flex flex-col gap-y-1">
              {dueOptions.map(option => {
                const isSelected = filters.due.includes(option.id);
                return (
                  <div 
                    key={option.id}
                    className="flex items-center gap-x-2 p-1.5 rounded-md hover:bg-hover-bg cursor-pointer"
                    onClick={() => handleToggle('due', option.id)}
                  >
                    <div className={`h-4 w-4 border rounded-sm flex items-center justify-center ${isSelected ? 'bg-sky-600 border-sky-600' : 'border-input'}`}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-sm ${option.color}`}>
                      {option.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Labels */}
          {labels.length > 0 && (
            <div className="flex flex-col gap-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-x-2">
                <Tag className="h-3 w-3" /> Labels
              </h4>
              <div className="flex flex-col gap-y-1">
                {labels.map(label => {
                  const isSelected = filters.labels.includes(label._id);
                  return (
                    <div 
                      key={label._id}
                      className="flex items-center gap-x-2 p-1.5 rounded-md hover:bg-hover-bg cursor-pointer"
                      onClick={() => handleToggle('labels', label._id)}
                    >
                      <div className={`h-4 w-4 border rounded-sm flex items-center justify-center shrink-0 ${isSelected ? 'bg-sky-600 border-sky-600' : 'border-input'}`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div 
                        className="flex-1 h-8 rounded-sm flex items-center px-3 text-sm font-medium"
                        style={{ backgroundColor: label.color, color: '#fff', textShadow: '0 0 2px rgba(0,0,0,0.3)' }}
                      >
                        {label.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </PopoverContent>
    </Popover>
  );
};
