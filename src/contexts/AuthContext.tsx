import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
  avatar?: string;
  phone?: string;
  joinDate: string;
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

// Mock users for UI demo (will be replaced with Lovable Cloud later)
const MOCK_USERS: (User & { password: string })[] = [
  { id: "admin-1", email: "admin@apsoncure.com", password: "admin123", name: "Dr. Prachi", role: "admin", phone: "+91 98765 43210", joinDate: "2023-01-01" },
  { id: "user-1", email: "priya@email.com", password: "user123", name: "Priya Sharma", role: "customer", phone: "+91 98765 43211", joinDate: "2023-06-10" },
];

const STORAGE_KEY = "apsoncure_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState<(User & { password: string })[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    const regUsers = localStorage.getItem("apsoncure_registered_users");
    if (regUsers) {
      try { setRegisteredUsers(JSON.parse(regUsers)); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const allUsers = [...MOCK_USERS, ...registeredUsers];

  const login = async (email: string, password: string) => {
    const found = allUsers.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    if (allUsers.find(u => u.email === email)) {
      return { success: false, error: "Email already registered" };
    }
    const newUser = { id: `user-${Date.now()}`, email, password, name, role: "customer" as const, phone, joinDate: new Date().toISOString().split('T')[0] };
    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    localStorage.setItem("apsoncure_registered_users", JSON.stringify(updated));
    const { password: _, ...userData } = newUser;
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
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
