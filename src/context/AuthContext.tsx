import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const TOKEN_KEY    = 'zoho_access_token';
const EXPIRY_KEY   = 'zoho_token_expiry';
const USER_KEY     = 'zoho_user';
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface ZohoUser {
  id: string;
  full_name: string;
  email: string;
  role?: string;
  profile?: string;
  // raw data from Zoho
  [key: string]: unknown;
}

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  expiresAt: number | null;
  user: ZohoUser | null;
  saveToken: (token: string) => void;
  saveUser: (user: ZohoUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  isAuthenticated: false,
  expiresAt: null,
  user: null,
  saveToken: () => {},
  saveUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken]         = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [expiresAt, setExpiresAt] = useState<number | null>(() => {
    const v = localStorage.getItem(EXPIRY_KEY);
    return v ? Number(v) : null;
  });
  const [user, setUser] = useState<ZohoUser | null>(() => {
    const v = localStorage.getItem(USER_KEY);
    return v ? JSON.parse(v) : null;
  });
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setExpiresAt(null);
    setUser(null);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    window.location.href = '/maritime-pms/login';
  };

  const saveToken = (newToken: string) => {
    const expiry = Date.now() + TOKEN_TTL_MS;
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(EXPIRY_KEY, String(expiry));
    setToken(newToken);
    setExpiresAt(expiry);
  };

  const saveUser = (u: ZohoUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  // Auto-logout when token expires
  useEffect(() => {
    if (!token || !expiresAt) return;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) { logout(); return; }
    logoutTimerRef.current = setTimeout(() => logout(), remaining);
    return () => { if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, expiresAt]);

  const isAuthenticated = !!token && !!expiresAt && Date.now() < expiresAt;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, expiresAt, user, saveToken, saveUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
