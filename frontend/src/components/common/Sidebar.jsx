import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentOrg } from '../../redux/slices/organizationSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';
import { Button } from '../ui/button';
import { Activity, Layout, Settings, CreditCard, Plus } from 'lucide-react';
import { CreateOrgModal } from '../organization/CreateOrgModal';

export const Sidebar = () => {
  const { organizations, currentOrg } = useSelector(state => state.organizations);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const handleNavigation = (org, path) => {
    if (currentOrg?._id !== org._id) {
      dispatch(setCurrentOrg(org));
    }
    navigate(path);
  };

  return (
    <div className="w-64 shrink-0 hidden md:block">
      <div className="font-medium text-xs flex items-center mb-1 justify-between text-neutral-500">
        <span className="pl-4">Workspaces</span>
        <CreateOrgModal trigger={
          <Button asChild type="button" size="icon" variant="ghost" className="ml-auto w-6 h-6 p-0 hover:bg-neutral-200 cursor-pointer">
            <Plus className="w-4 h-4" />
          </Button>
        } />
      </div>
      
      {(!organizations || organizations.length === 0) ? (
        <div className="text-sm text-muted-foreground pl-4 mt-2">
          No workspaces found. Create one to get started.
        </div>
      ) : (
      <Accordion 
        type="multiple" 
        defaultValue={[currentOrg?._id]}
        className="space-y-2"
      >
        {organizations.map(org => (
          <AccordionItem value={org._id} key={org._id} className="border-none">
            <AccordionTrigger className="flex items-center gap-x-2 p-1.5 text-neutral-700 rounded-md hover:bg-neutral-50 transition text-start no-underline hover:no-underline">
              <div className="flex items-center gap-x-2">
                <div className="w-7 h-7 bg-sky-700 rounded-sm flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold uppercase">{org.name?.charAt(0)}</span>
                </div>
                <span className="font-medium text-sm">{org.name}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 text-neutral-700">
              <div className="flex flex-col gap-y-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`justify-start font-normal ${location.pathname === '/' && currentOrg?._id === org._id ? 'bg-sky-50 text-sky-700' : ''}`}
                  onClick={() => handleNavigation(org, '/')}
                >
                  <Layout className="w-4 h-4 mr-2" /> Boards
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start font-normal"
                  onClick={() => handleNavigation(org, `/organization/${org._id}/activity`)}
                >
                  <Activity className="w-4 h-4 mr-2" /> Activity
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`justify-start font-normal ${location.pathname.includes('settings') && currentOrg?._id === org._id ? 'bg-sky-50 text-sky-700' : ''}`}
                  onClick={() => handleNavigation(org, `/organization/${org._id}/settings`)}
                >
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start font-normal"
                  onClick={() => handleNavigation(org, `/organization/${org._id}/billing`)}
                >
                  <CreditCard className="w-4 h-4 mr-2" /> Billing
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      )}
    </div>
  );
};
