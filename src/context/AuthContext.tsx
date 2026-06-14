import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const TOKEN_KEY      = 'pls_access_token';
const EXPIRY_KEY     = 'pls_token_expiry';
const USER_KEY       = 'pls_user';
const API_DOMAIN_KEY = 'pls_api_domain';
const TOKEN_TTL      = 60 * 60 * 1000; // 1 hour

export const DEFAULT_API_DOMAIN = 'https://www.zohoapis.in';

export interface AppUser {
  id: string;
  full_name: string;
  email: string;
  role?: string;
  profile?: string;
  [key: string]: unknown;
}

interface AuthContextValue {
  token: string | null;
  apiDomain: string;
  isAuthenticated: boolean;
  user: AppUser | null;
  saveToken: (token: string, apiDomain?: string) => void;
  saveUser: (u: AppUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  apiDomain: DEFAULT_API_DOMAIN,
  isAuthenticated: false,
  user: null,
  saveToken: () => {},
  saveUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken]       = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [apiDomain, setApiDomain] = useState<string>(
    () => localStorage.getItem(API_DOMAIN_KEY) ?? DEFAULT_API_DOMAIN
  );
  const [expiresAt, setExpiresAt] = useState<number | null>(() => {
    const v = localStorage.getItem(EXPIRY_KEY);
    return v ? Number(v) : null;
  });
  const [user, setUser] = useState<AppUser | null>(() => {
    const v = localStorage.getItem(USER_KEY);
    return v ? JSON.parse(v) : null;
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(API_DOMAIN_KEY);
    setToken(null);
    setExpiresAt(null);
    setUser(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    window.location.href = '/maritime-pms/login';
  };

  const saveToken = (newToken: string, domain?: string) => {
    const expiry = Date.now() + TOKEN_TTL;
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(EXPIRY_KEY, String(expiry));
    if (domain) {
      localStorage.setItem(API_DOMAIN_KEY, domain);
      setApiDomain(domain);
    }
    setToken(newToken);
    setExpiresAt(expiry);
  };

  const saveUser = (u: AppUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  useEffect(() => {
    if (!token || !expiresAt) return;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) { logout(); return; }
    timerRef.current = setTimeout(() => logout(), remaining);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, expiresAt]);

  const isAuthenticated = !!token && !!expiresAt && Date.now() < expiresAt;

  return (
    <AuthContext.Provider value={{ token, apiDomain, isAuthenticated, user, saveToken, saveUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
