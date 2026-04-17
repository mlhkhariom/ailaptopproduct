import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
  phone?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ailaptopwala_token');
    if (token) {
      api.me().then(setUser).catch(() => localStorage.removeItem('ailaptopwala_token')).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token, user } = await api.login(email, password);
      localStorage.setItem('ailaptopwala_token', token);
      setUser(user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const { token, user } = await api.register(name, email, password, phone);
      localStorage.setItem('ailaptopwala_token', token);
      setUser(user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('ailaptopwala_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
