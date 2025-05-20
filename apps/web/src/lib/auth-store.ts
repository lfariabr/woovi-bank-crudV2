type AuthState = {
    token: string | null;
    user: any | null;
  };
  
  let state: AuthState = {
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    user: null
  };
  
  const listeners = new Set<() => void>();
  
  export const authStore = {
    getState: () => state,
    setState: (newState: Partial<AuthState>) => {
      state = { ...state, ...newState };
      if (newState.token && typeof window !== 'undefined') {
        localStorage.setItem('token', newState.token);
      }
      listeners.forEach(listener => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };