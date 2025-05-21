type AuthState = {
  token: string | null;
  user: any | null;
};

let state: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null
};

const listeners = new Set<() => void>();

export const authStore = {
  getState: () => state,
  setState: (newState: Partial<AuthState>) => {
    state = { ...state, ...newState };
    if (newState.token && typeof window !== 'undefined') {
      localStorage.setItem('token', newState.token);
    }
    if (newState.user && typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(newState.user));
    }
    listeners.forEach(listener => listener());
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};