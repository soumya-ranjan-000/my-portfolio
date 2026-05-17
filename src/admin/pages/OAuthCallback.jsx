import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGitHubAuth } from '../../hooks/useGitHubAuth';
import toast, { Toaster } from 'react-hot-toast';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { saveToken } = useGitHubAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('No authorization code found in URL');
      return;
    }

    const exchangeCode = async () => {
      try {
        const response = await fetch(`/api/github-oauth?code=${code}`);
        if (!response.ok) {
          throw new Error('Token exchange request failed');
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error_description || data.error);
        }
        if (data.access_token) {
          saveToken(data.access_token);
          toast.success('Successfully logged in!');
          setTimeout(() => navigate('/admin'), 1500);
        } else {
          throw new Error('Access token not found in response');
        }
      } catch (err) {
        console.error('OAuth Error:', err);
        setError(err.message || 'An error occurred during authentication');
        toast.error('Authentication failed');
      }
    };

    exchangeCode();
  }, [searchParams, saveToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 text-slate-200">
      <Toaster position="bottom-right" />
      <div className="glass-card max-w-md w-full p-8 text-center border border-white/5 shadow-2xl">
        {error ? (
          <div>
            <h2 className="text-3xl font-heading font-bold text-red-500 mb-4">Authentication Error</h2>
            <p className="text-slate-400 mb-8">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="btn-outline py-3 px-6 text-center w-full"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <h3 className="text-xl font-heading font-bold text-white mt-4">Connecting to GitHub</h3>
            <p className="text-slate-400 text-sm">Please wait while we finalize your secure session...</p>
          </div>
        )}
      </div>
    </div>
  );
}
