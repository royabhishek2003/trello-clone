import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { injectStore } from './services/api';
import { store } from './redux/store';
import { fetchMe } from './redux/slices/authSlice';

// We inject the store into our api axios instance immediately
injectStore(store);

// Pages
import Dashboard from './pages/Dashboard';
import BoardDetail from './pages/BoardDetail';
import OrgSettings from './pages/OrgSettings';
import { CardModal } from './components/card/CardModal';
import { ProModal } from './components/subscription/ProModal';

function App() {
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
        <div className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Loading Workspace...
        </div>
      </div>
    );
  }

  // Even if not authenticated technically, our demo backend guarantees an auth fallback.
  // But just in case server is down:
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-900">
        <div className="text-xl font-semibold text-red-600 mb-2">Connection Error</div>
        <div className="text-gray-600">Failed to connect to the backend server. Is it running?</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/board/:id" element={<BoardDetail />} />
          <Route path="/organization/:id/settings" element={<OrgSettings />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <CardModal />
        <ProModal />
      </div>
    </BrowserRouter>
  );
}

export default App;
