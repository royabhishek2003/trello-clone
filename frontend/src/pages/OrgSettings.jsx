import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { MobileDrawer } from '../components/common/MobileDrawer';
import { ResponsiveBoardShell } from '../components/common/ResponsiveBoardShell';
import { checkSubscription } from '../redux/slices/subscriptionSlice';
import { Button } from '../components/ui/button';
import { openProModal } from '../redux/slices/uiSlice';
import { fetchOrganizations, deleteOrganization, updateOrganization } from '../redux/slices/organizationSlice';
import { Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OrgMembers from '../components/organization/OrgMembers';
import api from '../services/api';
import { toast } from 'sonner';

const OrgSettings = () => {
  const dispatch = useDispatch();
  const { currentOrg } = useSelector(state => state.organizations);
  const { isPro, loading } = useSelector(state => state.subscription);
  
  const [activeView, setActiveView] = useState('members'); // 'members' | 'settings'
  const [orgName, setOrgName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentOrg) {
      dispatch(checkSubscription(currentOrg._id));
      setOrgName(currentOrg.name || '');
    }
  }, [currentOrg, dispatch]);

  const handleUpdate = async () => {
    if (!orgName.trim() || orgName === currentOrg.name) return;
    
    try {
      setIsUpdating(true);
      await dispatch(updateOrganization({ id: currentOrg._id, data: { name: orgName } })).unwrap();
      toast.success('Organization updated successfully');
    } catch (error) {
      toast.error(error || 'Failed to update organization');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this organization? This action cannot be undone.")) return;
    
    try {
      setIsDeleting(true);
      await dispatch(deleteOrganization(currentOrg._id)).unwrap();
      toast.success('Organization deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error(error || 'Failed to delete organization');
      setIsDeleting(false);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  if (!currentOrg) return <div className="pt-20 text-center">Loading...</div>;

  return (
    <ResponsiveBoardShell
      header={<Navbar onMenuClick={() => setIsSidebarOpen(prev => !prev)} title="Settings" />}
      sidebar={
        <>
          <div className="hidden md:block pt-24 px-4 h-[100dvh] overflow-y-auto w-64 shrink-0 border-r bg-background">
            <Sidebar />
          </div>
          <MobileDrawer
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            title="Menu"
          >
            <div className="mt-2">
              <Sidebar />
            </div>
          </MobileDrawer>
        </>
      }
    >
      <div className="h-full overflow-y-auto px-4 md:px-6 pt-20 md:pt-24 pb-10">
        <div className="max-w-6xl 2xl:max-w-screen-xl mx-auto flex gap-x-7">
          <div className="flex-1 min-w-0 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 flex min-h-[500px]">
              {/* Inner Sidebar */}
              <div className="w-[280px] p-4 border-r border-neutral-200 flex flex-col gap-y-1">
                <div className="flex items-center gap-x-3 p-3 mb-2">
                  <div className="w-9 h-9 bg-indigo-500 rounded flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                  </div>
                  <p className="font-semibold text-sm text-neutral-700 truncate">{currentOrg.name}</p>
                </div>
                
                <button 
                  onClick={() => setActiveView('members')}
                  className={`flex items-center gap-x-3 px-3 py-2 rounded-md text-sm font-medium w-full text-left transition-colors ${activeView === 'members' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100/50 hover:text-neutral-900'}`}
                >
                  <User className="h-4 w-4" />
                  Members
                </button>
                
                <button 
                  onClick={() => setActiveView('settings_overview')}
                  className={`flex items-center gap-x-3 px-3 py-2 rounded-md text-sm font-medium w-full text-left transition-colors ${activeView.startsWith('settings') || activeView === 'organization_profile' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100/50 hover:text-neutral-900'}`}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>
              
              {/* Main Content Area */}
              <div className="flex-1 p-8">
                {activeView === 'members' ? (
                  <OrgMembers />
                ) : activeView === 'settings_overview' ? (
                  <div className="max-w-2xl">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-1">Settings</h2>
                    <p className="text-muted-foreground mb-8 text-sm">Manage organization settings</p>
                    
                    <h3 className="text-sm font-semibold text-neutral-900 mb-3">Organization Profile</h3>
                    <div 
                      className="flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-md cursor-pointer transition-colors"
                      onClick={() => setActiveView('organization_profile')}
                    >
                      <div className="flex items-center gap-x-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-md flex items-center justify-center shrink-0 shadow-sm">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                        </div>
                        <p className="font-medium text-neutral-700">{currentOrg.name}</p>
                      </div>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>

                    <div className="mt-10">
                      <h3 className="text-sm font-semibold text-neutral-900 mb-3">Danger</h3>
                      <div className="border border-neutral-200 bg-white rounded-md flex items-center gap-x-4 p-4 border-t border-t-red-100/50">
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs font-semibold px-4 py-2 h-auto" onClick={() => toast.error("Action disabled in this demo")}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          LEAVE ORGANIZATION
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs font-semibold px-4 py-2 h-auto" 
                          onClick={handleDelete}
                          disabled={isDeleting}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          {isDeleting ? 'DELETING...' : 'DELETE ORGANIZATION'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl">
                    <div className="flex items-center text-sm text-muted-foreground mb-6">
                      <button onClick={() => setActiveView('settings_overview')} className="flex items-center hover:text-neutral-700 transition-colors">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </button>
                      <span className="mx-2">/</span>
                      <span className="text-neutral-700 font-medium">Organization Profile</span>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-neutral-900 mb-1">Organization Profile</h2>
                    <p className="text-muted-foreground mb-8 text-sm">Manage organization profile</p>
                    
                    <div className="flex items-center gap-x-4 mb-8">
                      <div className="w-16 h-16 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-neutral-700">Profile image</p>
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-1">Upload image</button>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-900 mb-2">Organization name</label>
                        <input 
                          type="text" 
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-neutral-900 mb-2">Slug URL</label>
                        <input 
                          type="text" 
                          value={generateSlug(orgName) + '-'}
                          disabled
                          className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 text-neutral-500 rounded-md shadow-sm sm:text-sm"
                        />
                      </div>
                      
                      <div className="flex items-center justify-end gap-x-4 pt-6">
                        <Button 
                          variant="ghost" 
                          className="font-bold text-indigo-700 text-xs px-6 py-2 h-auto hover:bg-indigo-50"
                          onClick={() => setActiveView('settings_overview')}
                        >
                          CANCEL
                        </Button>
                        <Button 
                          variant="primary" 
                          className="bg-indigo-500 hover:bg-indigo-600 font-bold text-xs px-6 py-2 h-auto shadow-none"
                          onClick={handleUpdate}
                          disabled={isUpdating || !orgName.trim() || orgName === currentOrg.name}
                        >
                          CONTINUE
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveBoardShell>
  );
};

export default OrgSettings;
