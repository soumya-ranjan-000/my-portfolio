import { useState, useEffect, useCallback } from 'react';
import { Octokit } from '@octokit/rest';

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_GITHUB_USERNAME;
const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const TOKEN_KEY = 'portfolio_admin_token';
const USER_KEY = 'portfolio_admin_user';

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
    });
    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setIsAuthorized(false);
  }, []);

  const saveToken = useCallback((newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }, []);

  return { token, user, loading, isAuthorized, login, logout, saveToken };
}
