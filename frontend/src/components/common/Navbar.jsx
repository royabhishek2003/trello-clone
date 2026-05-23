import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../redux/slices/authSlice';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ChevronsUpDown, Menu } from 'lucide-react';
import { setCurrentOrg } from '../../redux/slices/organizationSlice';
import { CreateBoardPopover } from '../board/CreateBoardPopover';
import { CardSearchPopover } from './CardSearchPopover';

export const Navbar = ({ onMenuClick, title }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { organizations, currentOrg } = useSelector(state => state.organizations);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-14 border-b shadow-sm bg-white/80 backdrop-blur-xl flex items-center px-4 justify-between z-50">
      <div className="flex items-center gap-x-4">
        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden shrink-0">
          <Menu className="w-5 h-5 text-neutral-700" />
        </Button>

        <div className="hidden md:flex items-center gap-x-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="hover:bg-slate-100 flex items-center gap-2 px-2">
            <img src="/logo.svg" alt="Logo" className="w-5 h-5" />
            <span className="font-bold text-lg text-slate-700 pb-1">Taskify</span>
          </Button>
          <CreateBoardPopover side="bottom" sideOffset={18}>
            <Button variant="default" size="sm" className="hidden md:block bg-sky-700 hover:bg-sky-800 h-auto py-1.5 px-3">
              Create
            </Button>
          </CreateBoardPopover>
        </div>

        {/* Mobile Title */}
        {title && (
          <div className="md:hidden font-bold text-lg text-slate-700 truncate max-w-[120px] shrink min-w-0">
            {title}
          </div>
        )}
      </div>

      <div className="flex items-center gap-x-2 shrink-0">
        <CardSearchPopover />
        {/* Organization Switcher */}
        <div className="hidden md:flex items-center">
          {organizations && organizations.length > 0 ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-x-2 h-auto py-1 px-2 border-none">
                  {currentOrg ? (
                    <>
                      <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-sm flex items-center justify-center shrink-0">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                      </div>
                      <span className="font-medium text-sm text-neutral-700">{currentOrg.name}</span>
                    </>
                  ) : (
                    <span className="font-medium text-sm text-neutral-700">Select Workspace</span>
                  )}
                  <ChevronsUpDown className="w-4 h-4 text-neutral-500 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <div className="flex flex-col">
                  {organizations.map(org => (
                    <Button 
                      key={org._id} 
                      variant="ghost" 
                      className="justify-start rounded-none h-auto py-2"
                      onClick={() => {
                        dispatch(setCurrentOrg(org));
                        navigate('/');
                      }}
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-sm flex items-center justify-center shrink-0 mr-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                      </div>
                      {org.name}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="rounded-full w-8 h-8 p-0 shrink-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.imageUrl || ''} />
                <AvatarFallback>{(user?.firstName && typeof user.firstName === 'string' && user.firstName.length > 0) ? user.firstName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2">
            <div className="flex flex-col gap-y-2">
              <span className="text-sm font-medium text-center truncate">{user?.email || 'User'}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                Log Out
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
};
