import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { Provider } from 'react-redux';
import { store } from './redux/store';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { ThemeProvider } from './components/providers/ThemeProvider';

// Shadcn style toaster
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'no-client-id'}>
      <ThemeProvider>
        <App />
        <Toaster position="bottom-right" />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </Provider>,
);
