import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { injectStore } from './services/api';
import { store } from './redux/store';

// We inject the store into our api axios instance immediately
injectStore(store);

// Pages (to be created)
import Dashboard from './pages/Dashboard';
import BoardDetail from './pages/BoardDetail';
import OrgSettings from './pages/OrgSettings';
import Login from './pages/Login';
import Register from './pages/Register';
import { CardModal } from './components/card/CardModal';
import { ProModal } from './components/subscription/ProModal';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/board/:id" element={<ProtectedRoute><BoardDetail /></ProtectedRoute>} />
          <Route path="/organization/:id/settings" element={<ProtectedRoute><OrgSettings /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <CardModal />
        <ProModal />
      </div>
    </BrowserRouter>
  );
}

export default App;
