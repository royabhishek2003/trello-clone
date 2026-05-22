import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { demoLogin } from '../redux/slices/authSlice';

const LandingPage = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await dispatch(demoLogin()).unwrap();
      // App.jsx will automatically render Dashboard upon isAuthenticated = true
    } catch (error) {
      console.error("Demo login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-slate-200">
        <div className="flex items-center gap-x-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 shadow-sm">
             <div className="w-3 h-3 bg-white rounded-sm rotate-45 transform"></div>
          </div>
          <span className="font-bold text-xl text-neutral-800 tracking-tight">Taskify</span>
        </div>
        <div className="flex items-center gap-x-4">
          <button 
            onClick={handleDemoLogin} 
            disabled={isLoading}
            className="text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded px-4 py-2 hover:bg-slate-50 transition"
          >
            {isLoading ? 'Loading...' : 'Login'}
          </button>
          <button 
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded px-4 py-2 transition"
          >
            {isLoading ? 'Loading...' : 'Get Taskify for free'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 bg-amber-100 text-amber-800 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-x-2 shadow-sm uppercase tracking-widest border border-amber-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
          No 1 Task Management
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-800 tracking-tight mb-4">
          Taskify helps teams move
        </h1>
        
        <div className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-6 py-2 rounded-md mb-8 inline-block shadow-sm">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            work forward.
          </h1>
        </div>

        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Collaborate, manage projects, and reach new productivity peaks.
          From high rises to the home office, the way your team works is
          unique - accomplish it all with Taskify.
        </p>

        <button 
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="text-lg font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded px-8 py-3 transition shadow-sm"
        >
          {isLoading ? 'Loading Workspace...' : 'Get Taskify for free'}
        </button>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-4 bg-slate-100 border-t border-slate-200 text-sm text-slate-500 font-medium">
        <div className="flex items-center gap-x-2 text-slate-700">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
             <div className="w-2 h-2 bg-white rounded-sm rotate-45 transform"></div>
          </div>
          <span className="font-bold">Taskify</span>
        </div>
        <div className="flex items-center gap-x-6">
          <a href="#" className="hover:text-slate-700 transition">Privacy Policy</a>
          <a href="#" className="hover:text-slate-700 transition">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
