import React, { createContext, useContext, useState, useCallback } from 'react';
import type { CivixaSession } from '../types/civixa';
import { getSession, setSession, clearSession, getUsers, setUsers } from '../lib/storage';

interface SessionContextValue {
  session: CivixaSession | null;
  login: (email: string, role: 'admin' | 'moderator') => boolean;
  logout: () => void;
  updateSession: (updates: Partial<CivixaSession>) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<CivixaSession | null>(() => getSession());

  const login = useCallback((email: string, role: 'admin' | 'moderator'): boolean => {
    const users = getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (role === 'admin') {
      if (!user?.isAdmin) return false;
    } else if (role === 'moderator') {
      if (!user?.isModerator) return false;
    }

    if (!user) return false;

    const sess: CivixaSession = { ...user };
    setSession(sess);
    setSessionState(sess);
    return true;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
  }, []);

  const updateSession = useCallback((updates: Partial<CivixaSession>) => {
    setSessionState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      setSession(updated);

      // Also update in users list
      const users = getUsers();
      const idx = users.findIndex((u) => u.userId === prev.userId);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...updates };
        setUsers(users);
      }
      return updated;
    });
  }, []);

  return (
    <SessionContext.Provider value={{ session, login, logout, updateSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
