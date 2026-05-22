import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '../ui/popover';
import { Button } from '../ui/button';
import { X, Search, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { MemberAvatar } from '../ui/MemberAvatar';

export const MembersPopover = ({ children, cardMembers = [], onMemberToggle }) => {
  const { currentOrg } = useSelector(state => state.organizations);
  const [orgData, setOrgData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentOrg) {
      setLoading(true);
      api.get(`/api/orgs/${currentOrg._id}`)
        .then(res => {
          setOrgData(res.data);
        })
        .catch(err => console.error("Failed to fetch org details", err))
        .finally(() => setLoading(false));
    }
  }, [currentOrg]);

  const filteredMembers = orgData?.members?.filter(m => {
    const q = searchQuery.toLowerCase();
    const name = `${m.user.firstName || ''} ${m.user.lastName || ''}`.toLowerCase();
    const email = (m.user.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  }) || [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] p-3 shadow-xl z-[60]" 
        align="start" 
        side="left" 
        sideOffset={10}
        collisionPadding={20}
        style={{ maxHeight: 'var(--radix-popover-content-available-height)' }}
      >
        <div className="relative flex items-center justify-center pb-2 mb-2 border-b border-neutral-200 shrink-0">
          <span className="font-semibold text-sm text-neutral-700">Members</span>
          <PopoverClose asChild>
            <Button variant="ghost" className="h-auto w-auto p-1 absolute right-0 text-neutral-500 hover:text-neutral-800">
              <X className="h-4 w-4" />
            </Button>
          </PopoverClose>
        </div>

        <div className="flex flex-col overflow-hidden h-full">
          <div className="relative mb-3 shrink-0">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-neutral-400" />
            <input 
              className="w-full h-8 pl-8 pr-3 text-sm bg-neutral-100 border-none rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Search members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <p className="text-xs font-semibold text-neutral-600 mb-2 shrink-0">Workspace members</p>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1 pb-1">
            {loading ? (
              <p className="text-xs text-neutral-500 py-2 text-center">Loading members...</p>
            ) : filteredMembers.length === 0 ? (
              <p className="text-xs text-neutral-500 py-2 text-center">No members found.</p>
            ) : (
              filteredMembers.map(m => {
                const isAssigned = cardMembers.some(cm => cm._id === m.user._id || cm === m.user._id);
                
                return (
                  <div 
                    key={m.user._id}
                    onClick={() => onMemberToggle(m.user)}
                    className="flex items-center justify-between p-1.5 hover:bg-neutral-100 rounded cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-x-2">
                      <MemberAvatar member={m.user} />
                      <span className="text-sm text-neutral-700 font-medium">
                        {m.user.firstName} {m.user.lastName}
                      </span>
                    </div>
                    {isAssigned && <Check className="h-4 w-4 text-neutral-700" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
