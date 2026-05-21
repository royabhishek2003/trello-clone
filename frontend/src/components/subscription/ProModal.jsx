import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent } from '../ui/dialog';
import { closeProModal } from '../../redux/slices/uiSlice';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import api from '../../services/api';
import { checkSubscription } from '../../redux/slices/subscriptionSlice';

export const ProModal = () => {
  const dispatch = useDispatch();
  const { isProModalOpen } = useSelector(state => state.ui);
  const { currentOrg } = useSelector(state => state.organizations);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      // Create Razorpay Order
      const orderRes = await api.post('/api/subscriptions/create-order', {
        orgId: currentOrg._id
      });
      const order = orderRes.data;

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_S8bsxIXi8nAl6w',
        amount: order.amount,
        currency: order.currency,
        name: "Taskify MERN",
        description: "Upgrade to Pro",
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment
            await api.post('/api/subscriptions/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orgId: currentOrg._id
            });
            toast.success("Successfully upgraded to Pro!");
            dispatch(closeProModal());
            dispatch(checkSubscription(currentOrg._id));
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: "#0369a1" // sky-700
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error("Payment failed");
      });
      rzp.open();
    } catch (error) {
      toast.error("Could not initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isProModalOpen} onOpenChange={(open) => !open && dispatch(closeProModal())}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="aspect-video relative flex items-center justify-center bg-sky-700">
          <div className="text-white text-3xl font-bold">Taskify Pro</div>
        </div>
        <div className="text-neutral-700 mx-auto space-y-6 p-6">
          <h2 className="font-semibold text-xl">
            Upgrade to Taskify Pro Today!
          </h2>
          <p className="text-xs font-semibold text-neutral-600">
            Explore the best of Taskify
          </p>
          <div className="pl-3">
            <ul className="text-sm list-disc">
              <li>Unlimited boards</li>
              <li>Advanced checklists</li>
              <li>Admin and security features</li>
              <li>And more!</li>
            </ul>
          </div>
          <Button onClick={handleUpgrade} disabled={loading} className="w-full" variant="primary">
            {loading ? "Processing..." : "Upgrade"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
