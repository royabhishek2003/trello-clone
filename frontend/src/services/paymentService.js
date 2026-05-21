import api from './api';

export const checkSubscriptionApi = async (orgId) => {
  const response = await api.get(`/api/subscriptions/check?orgId=${orgId}`);
  return response.data;
};

export const createRazorpayOrderApi = async (orgId) => {
  const response = await api.post('/api/subscriptions/create-order', { orgId });
  return response.data;
};

export const verifyPaymentSignatureApi = async (paymentDetails) => {
  const response = await api.post('/api/subscriptions/verify-payment', paymentDetails);
  return response.data;
};

export const cancelSubscriptionApi = async (orgId) => {
  const response = await api.post('/api/subscriptions/cancel', { orgId });
  return response.data;
};
