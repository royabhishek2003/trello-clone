import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';

const ManageSubscription = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left side */}
      <div className="md:w-[40%] lg:w-[35%] bg-slate-50 border-b md:border-b-0 md:border-r border-neutral-200 p-8 md:p-12 lg:p-16 flex flex-col justify-start h-full md:min-h-screen relative">
        <div className="mb-12 flex items-center gap-x-2">
          <span className="bg-neutral-800 text-white rounded-sm w-4 h-4 flex items-center justify-center text-[10px] font-bold">T</span> 
          <span className="font-medium text-sm">trello-dev</span>
          <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Test mode</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-8 max-w-[280px]">
          trello-dev partners with Stripe for simplified billing.
        </h1>

        <button 
          onClick={() => navigate(`/organization/${id}/billing`)} 
          className="text-sm font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-x-2 transition-colors w-fit"
        >
          &larr; Return to trello-dev
        </button>

        <div className="absolute bottom-6 left-8 md:left-12 lg:left-16 text-xs text-neutral-400 flex gap-x-4">
          <span>Powered by <strong className="text-neutral-500 font-bold">stripe</strong></span>
          <a href="#" className="hover:text-neutral-600">Terms</a>
          <a href="#" className="hover:text-neutral-600">Privacy</a>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 p-6 md:p-12 lg:p-20 bg-white overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-12">
          
          {/* Current Plan Section */}
          <section>
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-4">Current Plan</h2>
            <div className="border-t border-neutral-200 pt-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Taskify Pro</h3>
                <div className="flex items-end gap-x-2 mb-3">
                  <span className="text-3xl font-bold text-neutral-900">US$20.00</span>
                  <span className="text-neutral-500 mb-1">per month</span>
                </div>
                <p className="text-sm text-neutral-500">
                  Your plan renews on 6 December 2023.
                </p>
              </div>
              <Button variant="outline" className="text-sm bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-md w-full sm:w-auto h-9">
                Cancel plan
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-x-3 text-sm text-neutral-700">
              <div className="w-8 h-5 bg-[#1434CB] rounded flex items-center justify-center shrink-0">
                <span className="text-white text-[9px] font-bold italic">VISA</span>
              </div>
              <span>Visa &bull;&bull;&bull;&bull; 4242</span>
              <button className="text-neutral-400 hover:text-neutral-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
            </div>
          </section>

          {/* Payment Method Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Payment Method</h2>
            </div>
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-3 text-sm text-neutral-700">
                  <div className="w-8 h-5 bg-[#1434CB] rounded flex items-center justify-center shrink-0">
                    <span className="text-white text-[9px] font-bold italic">VISA</span>
                  </div>
                  <span>Visa &bull;&bull;&bull;&bull; 4242</span>
                </div>
                <div className="flex items-center gap-x-8 text-sm text-neutral-500">
                  <span>Expires 05/2055</span>
                  <button className="text-neutral-400 hover:text-neutral-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Billing Address Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Billing Address</h2>
              <button className="text-sm font-medium text-[#0070e0] hover:text-[#005cbf]">Update information</button>
            </div>
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex flex-col gap-y-1 text-sm text-neutral-700">
                <p>HR</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ManageSubscription;
