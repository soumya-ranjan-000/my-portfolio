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
    // Check for GitHub code or query parameter errors
    const code = searchParams.get('code');
    const githubError = searchParams.get('error');
    const githubErrorDesc = searchParams.get('error_description');

    if (githubError) {
      const readableError = decodeURIComponent(githubErrorDesc?.replace(/\+/g, ' ') || githubError);
      setError({
        platform: 'github',
        code: githubError,
        message: readableError
      });
      toast.error('GitHub authentication failed');
      return;
    }

    if (!code) {
      setError({
        platform: 'unknown',
        code: 'no_code',
        message: 'No authorization code found in the URL. Please launch the login flow from the Admin Settings.'
      });
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
        setError({
          platform: 'github',
          code: 'exchange_failed',
          message: err.message || 'An error occurred during GitHub authentication'
        });
        toast.error('Authentication failed');
      }
    };

    exchangeCode();
  }, [searchParams, saveToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 text-slate-200 p-4">
      <Toaster position="bottom-right" />
      
      {error ? (
        /* General Error Presentation */
        <div className="glass-card max-w-md w-full p-8 border border-red-500/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -z-10"></div>
          
          <div className="text-center mb-6">
            <span className="inline-flex p-3 bg-red-500/10 rounded-2xl text-red-500 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <h2 className="text-2xl font-heading font-bold text-white mb-2">Authentication Error</h2>
            <p className="text-slate-400 text-sm mt-1">
              An issue occurred while authenticating with GitHub.
            </p>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-6 text-left">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Error Message</span>
            <p className="text-slate-300 font-mono text-sm break-words">{error.message}</p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigate('/admin')}
              className="btn-primary py-3 px-6 text-center w-full text-sm font-semibold"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-outline py-3 px-6 text-center w-full text-sm font-semibold"
            >
              Back to Public Site
            </button>
          </div>
        </div>
      ) : (
        /* Visual authentication/connecting loader card */
        <div className="glass-card max-w-md w-full p-8 text-center border border-white/5 shadow-2xl">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <h3 className="text-xl font-heading font-bold text-white mt-4">Connecting with Provider</h3>
            <p className="text-slate-400 text-sm">Please wait while we finalize your secure session...</p>
          </div>
        </div>
      )}
    </div>
  );
}
