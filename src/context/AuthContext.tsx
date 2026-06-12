import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const SESSION_KEY  = 'pms_session';
const EXPIRY_KEY   = 'pms_session_expiry';
const USER_KEY     = 'pms_user';
const SESSION_TTL  = 8 * 60 * 60 * 1000; // 8 hours

export interface AppUser {
  full_name: string;
  email: string;
  role: string;
}

// Demo credentials — add more rows as needed
const VALID_USERS: Record<string, { password: string; user: AppUser }> = {
  'admin@marineops.com': {
    password: 'admin123',
    user: { full_name: 'Admin User', email: 'admin@marineops.com', role: 'Fleet Manager' },
  },
  'harsh.k@zohocorp.com': {
    password: 'admin123',
    user: { full_name: 'Harsh K', email: 'harsh.k@zohocorp.com', role: 'Fleet Manager' },
  },
  'engineer@marineops.com': {
    password: 'eng123',
    user: { full_name: 'Chief Engineer', email: 'engineer@marineops.com', role: 'Chief Engineer' },
  },
};

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AppUser | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  user: null,
  login: () => ({ ok: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));
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
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(USER_KEY);
    setSession(null);
    setExpiresAt(null);
    setUser(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    window.location.href = '/maritime-pms/login';
  };

  const login = (email: string, password: string): { ok: boolean; error?: string } => {
    const entry = VALID_USERS[email.toLowerCase().trim()];
    if (!entry || entry.password !== password) {
      return { ok: false, error: 'Invalid email or password.' };
    }
    const expiry = Date.now() + SESSION_TTL;
    const token  = btoa(`${email}:${Date.now()}`);
    localStorage.setItem(SESSION_KEY, token);
    localStorage.setItem(EXPIRY_KEY, String(expiry));
    localStorage.setItem(USER_KEY, JSON.stringify(entry.user));
    setSession(token);
    setExpiresAt(expiry);
    setUser(entry.user);
    return { ok: true };
  };

  // Auto-logout when session expires
  useEffect(() => {
    if (!session || !expiresAt) return;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) { logout(); return; }
    timerRef.current = setTimeout(() => logout(), remaining);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, expiresAt]);

  const isAuthenticated = !!session && !!expiresAt && Date.now() < expiresAt;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
