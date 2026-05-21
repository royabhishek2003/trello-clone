import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { checkSubscription } from '../redux/slices/subscriptionSlice';
import { Button } from '../components/ui/button';
import { openProModal } from '../redux/slices/uiSlice';
import { Settings } from 'lucide-react';

const OrgSettings = () => {
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
            <div>
              <h1 className="text-2xl font-bold text-neutral-700 flex items-center">
                <Settings className="w-6 h-6 mr-2" />
                Settings for {currentOrg.title}
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your organization settings and subscription.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h2 className="text-lg font-semibold mb-4">Subscription Plan</h2>
              {loading ? (
                <p>Loading subscription details...</p>
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
                  <Button onClick={() => dispatch(openProModal())} variant="primary">
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

export default OrgSettings;
