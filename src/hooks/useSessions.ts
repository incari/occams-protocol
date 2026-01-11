import { useState, useEffect, useCallback } from 'react';
import type { TrainingSession } from '../types';
import { getSessions, addSession, updateSession, deleteSession } from '../utils/storage';

export function useSessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessions(getSessions());
    setLoading(false);
  }, []);

  const createSession = useCallback((session: Omit<TrainingSession, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSession: TrainingSession = {
      ...session,
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (addSession(newSession)) {
      setSessions((prev) => [...prev, newSession].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      return newSession;
    }
    return null;
  }, []);

  const editSession = useCallback((id: string, updates: Partial<TrainingSession>) => {
    if (updateSession(id, updates)) {
      setSessions((prev) =>
        prev
          .map((s) => (s.id === id ? { ...s, ...updates } : s))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      return true;
    }
    return false;
  }, []);

  const removeSession = useCallback((id: string) => {
    if (deleteSession(id)) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      return true;
    }
    return false;
  }, []);

  const getSessionsByDate = useCallback((date: string) => {
    return sessions.filter((s) => s.date === date);
  }, [sessions]);

  const getSessionsByVariant = useCallback((variant: 'A' | 'V') => {
    return sessions.filter((s) => s.variant === variant);
  }, [sessions]);

  return {
    sessions,
    loading,
    createSession,
    editSession,
    removeSession,
    getSessionsByDate,
    getSessionsByVariant,
  };
}
