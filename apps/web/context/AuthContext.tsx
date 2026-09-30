"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { User, setToken, removeToken, setStoredUser, removeStoredUser } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { useSession, signIn, signUp, signOut } from "@/lib/auth-client";

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
  signIn: typeof signIn;
  signUp: typeof signUp;
  useSession: typeof useSession;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, isPending: sessionLoading, error: sessionError, refetch } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authActionLoading, setAuthActionLoading] = useState<boolean>(false);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const rawUser = session?.user;
  const rawSession = session?.session;

  const user: User | null = useMemo(() => {
    if (!rawUser) return null;
    return {
      id: rawUser.id,
      name: rawUser.name || rawUser.email.split('@')[0],
      email: rawUser.email,
      role: (rawUser as any).role || 'customer',
      created_at: rawUser.createdAt ? new Date(rawUser.createdAt).toISOString() : undefined,
      encrypted_phone: (rawUser as any).encrypted_phone || null,
      encrypted_address: (rawUser as any).encrypted_address || null,
    };
  }, [rawUser]);

  const token: string | null = rawSession?.token || null;
  const isLoading = sessionLoading || authActionLoading;
  const isAuthenticated = !!user;

  // Synchronize Better Auth session with LocalStorage for backward compatibility
  useEffect(() => {
    if (token) {
      setToken(token);
    } else if (!sessionLoading && !session) {
      removeToken();
    }

    if (user) {
      setStoredUser(user);
    } else if (!sessionLoading && !session) {
      removeStoredUser();
    }
  }, [token, user, sessionLoading, session]);

  const login = async (email: string, password: string) => {
    setAuthActionLoading(true);
    try {
      const res = await signIn.email({
        email,
        password,
      });

      if (res.error) {
        throw new Error(res.error.message || "Invalid credentials. Please try again.");
      }

      await refetch();
      setIsAuthModalOpen(false);
      toast.success("Welcome Back", {
        description: `Signed in as ${res.data?.user?.name || email}`,
      });
    } catch (err: any) {
      toast.error("Sign In Failed", {
        description: err.message || "Invalid credentials. Please try again.",
      });
      throw err;
    } finally {
      setAuthActionLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setAuthActionLoading(true);
    try {
      const res = await signUp.email({
        name,
        email,
        password,
      });

      if (res.error) {
        throw new Error(res.error.message || "Registration failed");
      }

      await refetch();
      setIsAuthModalOpen(false);
      toast.success("Account Created", {
        description: `Welcome to Amore, ${name}!`,
      });
    } catch (err: any) {
      toast.error("Registration Failed", {
        description: err.message || "Could not register account.",
      });
      throw err;
    } finally {
      setAuthActionLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.warn("Sign out error:", err);
    }
    removeToken();
    removeStoredUser();
    await refetch();
    toast.info("Logged Out", {
      description: "You have been signed out of your account.",
    });
  };

  const refreshUser = async () => {
    await refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        refreshUser,
        signIn,
        signUp,
        useSession,
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
