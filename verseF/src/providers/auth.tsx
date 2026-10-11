import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: string;
};
const Auth = createContext<{
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
} | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true);
  const refresh = async () => {
    try {
      setUser((await api<{ user: User }>("/auth/me")).user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  const logout = async () => {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
  };
  return (
    <Auth.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </Auth.Provider>
  );
}
export const useAuth = () => {
  const context = useContext(Auth);
  if (!context) throw new Error("AuthProvider is required");
  return context;
};
