import React, { createContext, useContext, useState } from 'react';

const CREDENTIALS = {
  email:    import.meta.env.VITE_AUTH_EMAIL    || '',
  password: import.meta.env.VITE_AUTH_PASSWORD || '',
};

const AUTH_KEY = 'servicelab_auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!(localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY));
  });

  const login = (email, password, remember) => {
    if (email === CREDENTIALS.email && password === CREDENTIALS.password) {
      if (remember) {
        localStorage.setItem(AUTH_KEY, '1');
      } else {
        sessionStorage.setItem(AUTH_KEY, '1');
      }
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
