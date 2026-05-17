import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGitHubAuth } from '../../hooks/useGitHubAuth';

export default function ProtectedRoute({ children }) {
  const { token, loading, isAuthorized, login, user } = useGitHubAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
        <div className="glass-card max-w-md w-full p-8 text-center border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary-500/10 blur-3xl rounded-full"></div>

          <h2 className="text-3xl font-heading font-bold text-white mb-4 relative z-10">Admin Access</h2>
          <p className="text-slate-400 mb-8 relative z-10">
            This dashboard is restricted to the administrator. Please log in with GitHub to continue.
          </p>
          <button
            onClick={login}
            className="w-full btn-primary py-3 px-6 flex items-center justify-center gap-3 relative z-10"
          >
            <span>Login with GitHub</span>
          </button>
        </div>
      </div>
    );
  }

  // Logged in, but unauthorized username
  if (!isAuthorized && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
        <div className="glass-card max-w-md w-full p-8 text-center border border-red-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full"></div>
          
          <h2 className="text-3xl font-heading font-bold text-red-500 mb-4 relative z-10">403 Access Denied</h2>
          <p className="text-slate-400 mb-6 relative z-10">
            Authenticated as <strong className="text-white">@{user.login}</strong>, but this user is not authorized. Only the portfolio owner can access this dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full btn-outline py-3 px-6 text-center relative z-10"
          >
            Go back to Portfolio
          </button>
        </div>
      </div>
    );
  }

  return children;
}
