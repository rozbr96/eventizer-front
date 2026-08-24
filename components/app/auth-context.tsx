import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import api from "@/lib/api";
import { type User } from "@/lib/api/common-entities";

type AuthContextValue = {
  user: User | null;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = () => {
    return api.auth.state()
      .then((currentUser) => {
        setUser(currentUser);

        return currentUser;
      })
      .catch(() => {
        setUser(null);

        return null;
      });
  }

  const logout = () => {
    return api.auth.logout()
      .then(() => {
        setUser(null);
      });
  }

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useAuth must be used within AuthProvider");

  return context;
}
