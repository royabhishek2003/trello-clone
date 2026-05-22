import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { checkSubscription } from '../redux/slices/subscriptionSlice';
import { Button } from '../components/ui/button';
import { openProModal } from '../redux/slices/uiSlice';

const OrgBilling = () => {
  const dispatch = useDispatch();
  const { currentOrg } = useSelector(state => state.organizations);
  const { isPro, loading } = useSelector(state => state.subscription);

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
            <div className="w-full">
              <div className="flex items-center gap-x-4 mb-8 border-b pb-8 border-neutral-200">
                <div className="w-16 h-16 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                </div>
                <div>
                  <h1 className="font-bold text-xl text-neutral-900">{currentOrg.name}</h1>
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                    {isPro ? "Pro" : "Free"}
                  </p>
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading subscription details...</p>
              ) : isPro ? (
                <div>
                  <Button 
                    onClick={() => window.location.href = `/organization/${currentOrg._id}/manage-subscription`}
                    variant="primary" 
                    className="bg-[#026AA2] hover:bg-[#025a8a] text-white font-semibold text-sm px-4 py-2 shadow-sm rounded-md h-auto"
                  >
                    Manage Subscription
                  </Button>
                </div>
              ) : (
                <div>
                  <Button 
                    onClick={() => dispatch(openProModal())} 
                    variant="primary" 
                    className="bg-[#026AA2] hover:bg-[#025a8a] text-white font-semibold text-sm px-4 py-2 shadow-sm rounded-md h-auto"
                  >
                    Upgrade to Pro
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrgBilling;
