import React, { createContext, useContext, useEffect, useState } from "react";
import type { Role } from "../api/authApi";

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  email: string | null;
  role: Role | null;
}

interface AuthContextType extends AuthState {
  login: (accessToken: string, user: { id: string; email: string; role: Role }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    userId: null,
    email: null,
    role: null,
  });

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role") as Role | null;

    if (accessToken && userId && role) {
      setState({ accessToken, userId, email, role });
    }
  }, []);

  const login = (accessToken: string, user: { id: string; email: string; role: Role }) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("userId", user.id);
    localStorage.setItem("email", user.email);
    localStorage.setItem("role", user.role);
    setState({ accessToken, userId: user.id, email: user.email, role: user.role });
  };

  const logout = () => {
    localStorage.clear();
    setState({ accessToken: null, userId: null, email: null, role: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
