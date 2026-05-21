import axios from 'axios';
// We will import store dynamically to prevent circular dependencies
let store;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true, // critical to receive and send HttpOnly refresh cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Inject store reference
export const injectStore = (_store) => {
  store = _store;
};

// Request interceptor to append JWT token
api.interceptors.request.use(
  (config) => {
    if (store) {
      const token = store.getState().auth.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop on auth endpoints
    if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log('Access token expired, attempting silent refresh...');
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { token } = response.data;
        
        if (store) {
          // Update access token inside Redux store
          store.dispatch({ type: 'auth/refreshTokenSuccess', payload: token });
        }

        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Silent refresh token expired or failed:', refreshError.message);
        if (store) {
          // Log out user
          store.dispatch({ type: 'auth/logoutSuccess' });
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
