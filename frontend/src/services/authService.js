import api from './api';

export const registerUser = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post('/api/auth/login', userData);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/api/auth/logout');
  return response.data;
};

export const googleOAuthLogin = async (idToken) => {
  const response = await api.post('/api/auth/google', { token: idToken });
  return response.data;
};
