import { Lead, initialLead } from "./lead-state";

const STORAGE_KEY = "cassiano-diagnostico-v2";

export type SavedSession = {
  lead: Lead;
  step: number;
  completed: boolean;
  screen?: string;
  savedAt: string;
  notifications?: {
    startedAt?: string;
    completedAt?: string;
  };
};

export function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedSession;
    return { ...parsed, lead: { ...initialLead, ...parsed.lead } };
  } catch {
    return null;
  }
}

export function saveSession(session: SavedSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...session, savedAt: new Date().toISOString() }));
    return true;
  } catch {
    return false;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}
