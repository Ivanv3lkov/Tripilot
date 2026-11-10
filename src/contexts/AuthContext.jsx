import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

// TODO: Replace in-memory session with the selected auth provider (login, register, logout, restore).
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      signIn: (nextUser) => setUser(nextUser),
      signOut: () => setUser(null),
    }),
    [user],
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
