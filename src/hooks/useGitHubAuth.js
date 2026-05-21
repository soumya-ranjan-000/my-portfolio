import { useState, useEffect, useCallback } from 'react';
import { Octokit } from '@octokit/rest';

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_GITHUB_USERNAME;
const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const TOKEN_KEY = 'portfolio_admin_token';
const USER_KEY = 'portfolio_admin_user';
const AUTH_STORAGE_KEYS = [TOKEN_KEY, USER_KEY];

function clearSameOriginAuthFootprint() {
  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0]?.trim();
    if (!name) return;

    document.cookie = `${name}=; Max-Age=0; path=/`;
    document.cookie = `${name}=; Max-Age=0; path=/admin`;
  });
}

async function revokeGitHubToken(accessToken) {
  if (!accessToken) return;

  try {
    await fetch('/api/github-oauth', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken }),
    });
  } catch {
    // Local cleanup still signs the admin out even if token revocation is unavailable.
  }
}

export function useGitHubAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY) && !localStorage.getItem(USER_KEY));
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!token) { setIsAuthorized(false); return; }
    if (user) { setIsAuthorized(user.login === ADMIN_USERNAME); return; }

    setLoading(true);
    const octokit = new Octokit({ auth: token });
    octokit.users.getAuthenticated()
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem(USER_KEY, JSON.stringify(data));
        setIsAuthorized(data.login === ADMIN_USERNAME);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
        setIsAuthorized(false);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(() => {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      scope: 'repo',
      redirect_uri: `${window.location.origin}/admin/callback`,
      prompt: 'select_account',
    });
    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  }, []);

  const logout = useCallback(() => {
    const currentToken = token || localStorage.getItem(TOKEN_KEY);

    revokeGitHubToken(currentToken);
    clearSameOriginAuthFootprint();
    setToken(null);
    setUser(null);
    setIsAuthorized(false);
  }, [token]);

  const saveToken = useCallback((newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }, []);

  return { token, user, loading, isAuthorized, login, logout, saveToken };
}
