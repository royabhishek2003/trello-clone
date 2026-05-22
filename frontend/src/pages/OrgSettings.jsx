import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { checkSubscription } from '../redux/slices/subscriptionSlice';
import { Button } from '../components/ui/button';
import { openProModal } from '../redux/slices/uiSlice';
import { Settings, User } from 'lucide-react';
import OrgMembers from '../components/organization/OrgMembers';

const OrgSettings = () => {
  const dispatch = useDispatch();
  const { currentOrg } = useSelector(state => state.organizations);
  const { isPro, loading } = useSelector(state => state.subscription);
  
  const [activeView, setActiveView] = useState('members'); // 'members' | 'settings'

  useEffect(() => {
    if (currentOrg) {
      dispatch(checkSubscription(currentOrg._id));
    }
  }, [currentOrg, dispatch]);

  if (!currentOrg) return <div className="pt-20 text-center">Loading...</div>;

  return (
    <div className="h-full">
      <Navbar />
      <main className="pt-20 md:pt-24 px-4 max-w-6xl 2xl:max-w-screen-xl mx-auto">
        <div className="flex gap-x-7">
          <Sidebar />
          
          <div className="flex-1 space-y-6">
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
                  onClick={() => setActiveView('settings')}
                  className={`flex items-center gap-x-3 px-3 py-2 rounded-md text-sm font-medium w-full text-left transition-colors ${activeView === 'settings' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100/50 hover:text-neutral-900'}`}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>
              
              {/* Main Content Area */}
              <div className="flex-1 p-8">
                {activeView === 'members' ? (
                  <OrgMembers />
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-700 mb-1">Settings</h2>
                    <p className="text-muted-foreground mb-8 text-sm">Manage your organization settings and subscription.</p>
                    
                    <div className="bg-white rounded-lg border border-neutral-200 p-6">
                      <h3 className="text-lg font-semibold mb-4">Subscription Plan</h3>
                      {loading ? (
                        <p className="text-sm text-muted-foreground">Loading subscription details...</p>
                      ) : isPro ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
                            <p className="font-semibold">You are currently on the Pro plan.</p>
                            <p className="text-sm mt-1">Enjoy unlimited boards and premium features.</p>
                          </div>
                          <Button variant="outline" className="text-red-600 hover:text-red-700">Cancel Subscription</Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                            <p className="font-semibold">You are currently on the Free plan.</p>
                            <p className="text-sm mt-1">You are limited to 5 boards per organization.</p>
                          </div>
                          <Button onClick={() => dispatch(openProModal())} variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
                            Upgrade to Pro
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrgSettings;
