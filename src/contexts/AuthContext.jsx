import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  logout,
  restoreSession,
  subscribeToAuthChanges,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // Restore the persisted session once, then follow login, registration,
  // token refresh, and logout through session changes.
  useEffect(() => {
    let isActive = true;
    const unsubscribe = subscribeToAuthChanges(setUser);

    restoreSession()
      .catch(() => null)
      .then((restoredUser) => {
        if (!isActive) return;
        setUser(restoredUser);
        setIsRestoring(false);
      });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isRestoring,
      signOut: logout,
    }),
    [user, isRestoring],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
