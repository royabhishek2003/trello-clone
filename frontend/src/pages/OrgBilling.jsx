import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { checkSubscription } from '../redux/slices/subscriptionSlice';
import { Button } from '../components/ui/button';
import { openProModal } from '../redux/slices/uiSlice';
import { CreditCard, Zap, Shield, Users, BarChart3, Check } from 'lucide-react';

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

  const freeFeatures = [
    'Up to 10 boards per workspace',
    'Unlimited cards',
    'Basic checklists',
    'Attachment uploads (10MB limit)',
    'Activity log',
  ];

  const proFeatures = [
    'Unlimited boards',
    'Unlimited cards',
    'Advanced checklists with due dates',
    'Attachment uploads (250MB limit)',
    'Priority support',
    'Admin & security features',
    'Custom backgrounds & stickers',
  ];

  return (
    <div className="h-full">
      <Navbar />
      <main className="pt-20 md:pt-24 px-4 max-w-6xl 2xl:max-w-screen-xl mx-auto">
        <div className="flex gap-x-7">
          <div className="w-64 shrink-0 hidden md:block">
            <Sidebar />
          </div>
          
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-x-4 pb-6 border-b border-neutral-200">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
              </div>
              <div>
                <h1 className="font-bold text-xl text-neutral-900">{currentOrg.name}</h1>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                  {isPro ? "Pro" : "Free"}
                </p>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading subscription details...</p>
            ) : (
              <div className="space-y-8">
                {/* Current Plan */}
                <div>
                  <h2 className="text-lg font-semibold text-neutral-800 mb-4">Current Plan</h2>
                  <div className={`rounded-lg border-2 p-6 ${isPro ? 'border-indigo-200 bg-indigo-50/30' : 'border-neutral-200 bg-neutral-50/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPro ? 'bg-indigo-500' : 'bg-neutral-400'}`}>
                          {isPro ? <Zap className="h-5 w-5 text-white" /> : <Shield className="h-5 w-5 text-white" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-900">{isPro ? 'Taskify Pro' : 'Taskify Free'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {isPro ? 'Full access to all features' : 'Basic features for personal use'}
                          </p>
                        </div>
                      </div>
                      {isPro ? (
                        <Button 
                          onClick={() => window.location.href = `/organization/${currentOrg._id}/manage-subscription`}
                          variant="primary" 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 shadow-sm rounded-md h-auto"
                        >
                          Manage Subscription
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => dispatch(openProModal())} 
                          variant="primary" 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 shadow-sm rounded-md h-auto"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Upgrade to Pro
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Plan Comparison */}
                <div>
                  <h2 className="text-lg font-semibold text-neutral-800 mb-4">Plan Comparison</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Free Plan */}
                    <div className={`rounded-lg border p-5 ${!isPro ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-neutral-200'}`}>
                      <div className="flex items-center gap-x-2 mb-1">
                        <Shield className="h-5 w-5 text-neutral-500" />
                        <h3 className="font-bold text-neutral-800">Free</h3>
                        {!isPro && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold uppercase ml-1">Current</span>}
                      </div>
                      <p className="text-2xl font-bold text-neutral-900 mb-4">$0 <span className="text-sm font-normal text-muted-foreground">/ month</span></p>
                      <ul className="space-y-2.5">
                        {freeFeatures.map((f, i) => (
                          <li key={i} className="flex items-start gap-x-2 text-sm text-neutral-600">
                            <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pro Plan */}
                    <div className={`rounded-lg border p-5 ${isPro ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-neutral-200'}`}>
                      <div className="flex items-center gap-x-2 mb-1">
                        <Zap className="h-5 w-5 text-indigo-500" />
                        <h3 className="font-bold text-neutral-800">Pro</h3>
                        {isPro && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold uppercase ml-1">Current</span>}
                      </div>
                      <p className="text-2xl font-bold text-neutral-900 mb-4">₹100 <span className="text-sm font-normal text-muted-foreground">/ month</span></p>
                      <ul className="space-y-2.5">
                        {proFeatures.map((f, i) => (
                          <li key={i} className="flex items-start gap-x-2 text-sm text-neutral-600">
                            <Check className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Billing Info */}
                <div className="pb-8">
                  <h2 className="text-lg font-semibold text-neutral-800 mb-4">Billing Information</h2>
                  <div className="rounded-lg border border-neutral-200 p-5 bg-neutral-50/50">
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Payment method</p>
                        <p className="font-medium text-neutral-700 mt-1">{isPro ? 'Razorpay' : 'None'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Billing cycle</p>
                        <p className="font-medium text-neutral-700 mt-1">{isPro ? 'Monthly' : '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Workspace</p>
                        <p className="font-medium text-neutral-700 mt-1">{currentOrg.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium mt-1">
                          {isPro 
                            ? <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-semibold">Active</span>
                            : <span className="text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded text-xs font-semibold">Free Tier</span>
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrgBilling;
