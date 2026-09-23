"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  User,
  getToken,
  getStoredUser,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
} from "@/lib/api";
import { toast } from "@/components/ui/sonner";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Load stored auth on mount
  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getStoredUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
      // Verify token in background with backend
      getCurrentUser()
        .then((latestUser) => {
          if (latestUser) {
            setUser(latestUser);
          }
        })
        .catch(() => {
          // If token verification fails, keep stored or clear
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(email, password);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
      toast.success("Welcome Back", {
        description: `Signed in as ${res.user.name} (${res.user.role})`,
      });
    } catch (err: any) {
      toast.error("Sign In Failed", {
        description: err.message || "Invalid credentials. Please try again.",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiRegister(name, email, password);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
      toast.success("Account Created", {
        description: `Welcome to Amore, ${res.user.name}!`,
      });
    } catch (err: any) {
      toast.error("Registration Failed", {
        description: err.message || "Could not register account.",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setToken(null);
    setUser(null);
    toast.info("Logged Out", {
      description: "You have been signed out of your account.",
    });
  };

  const refreshUser = async () => {
    const latestUser = await getCurrentUser();
    setUser(latestUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
