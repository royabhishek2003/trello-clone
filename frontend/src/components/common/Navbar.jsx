import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../redux/slices/authSlice';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Layout } from 'lucide-react';
import { setCurrentOrg } from '../../redux/slices/organizationSlice';

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { organizations, currentOrg } = useSelector(state => state.organizations);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full h-14 border-b shadow-sm bg-white flex items-center px-4 justify-between z-50">
      <div className="flex items-center gap-x-4">
        <div className="hidden md:flex">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="hover:bg-slate-100 flex items-center gap-2">
            <Layout className="w-5 h-5 text-sky-700" />
            <span className="font-bold text-lg text-slate-700 pb-1">Taskify MERN</span>
          </Button>
        </div>

        {/* Organization Switcher */}
        {organizations.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex justify-between w-[200px]">
                {currentOrg ? currentOrg.name : "Select Organization"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <div className="flex flex-col">
                {organizations.map(org => (
                  <Button 
                    key={org._id} 
                    variant="ghost" 
                    className="justify-start rounded-none"
                    onClick={() => dispatch(setCurrentOrg(org))}
                  >
                    {org.name}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex items-center gap-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="rounded-full w-8 h-8 p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>{user?.firstName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2">
            <div className="flex flex-col gap-y-2">
              <span className="text-sm font-medium text-center truncate">{user?.email}</span>
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
