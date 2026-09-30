"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, User as UserIcon, Lock, Mail, Package, LogOut, CheckCircle2, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders, Order } from "@/lib/api";
import { formatINR } from "@/lib/utils";

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isAuthModalOpen,
    closeAuthModal,
    login,
    register,
    logout,
    isLoading,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "register" | "orders">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Switch to account/orders if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setMode("orders");
    } else {
      setMode("signin");
    }
  }, [isAuthenticated, isAuthModalOpen]);

  // Fetch orders when viewing orders tab
  useEffect(() => {
    if (isAuthModalOpen && isAuthenticated && user) {
      setLoadingOrders(true);
      getUserOrders(user.id)
        .then((data) => setOrders(data))
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false));
    }
  }, [isAuthModalOpen, isAuthenticated, user]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    if (isAuthModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await register(name, email, password);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register");
    }
  };

  const fillDemoClient = () => {
    setEmail("client@amorecosmetics.in");
    setPassword("user123");
    setErrorMsg("");
  };

  const fillDemoAdmin = () => {
    setEmail("admin@amorecosmetics.in");
    setPassword("admin123");
    setErrorMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={closeAuthModal}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white border border-neutral-200 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center space-x-2">
            <UserIcon className="w-4 h-4 text-black" />
            <h2 className="text-xs font-semibold tracking-[0.25em] uppercase text-black">
              {isAuthenticated ? "CLIENT ACCOUNT" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </h2>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs tracking-wider uppercase font-mono">
              {errorMsg}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: LOGGED-IN ACCOUNT & RECENT ORDERS */}
          {/* ========================================================================= */}
          {isAuthenticated && user ? (
            <div className="space-y-6">
              <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-black">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-black text-white px-2 py-0.5 tracking-widest">
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 font-mono tracking-wide">{user.email}</p>
                <div className="pt-2 flex items-center space-x-1.5 text-[11px] text-neutral-500">
                  <Shield className="w-3.5 h-3.5 text-black shrink-0" />
                  <span>Neon PostgreSQL AES-256 Authentication</span>
                </div>
                {user.role === 'admin' && (
                  <div className="pt-3 border-t border-neutral-200">
                    <Link
                      href="/admin"
                      onClick={closeAuthModal}
                      className="w-full py-2 bg-neutral-900 text-white hover:bg-black text-[11px] font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition"
                    >
                      <Shield className="w-3.5 h-3.5 text-rose-400" />
                      <span>Open Admin Console</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-black" />
                    <span>YOUR ORDER HISTORY</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    ({orders.length} {orders.length === 1 ? "order" : "orders"})
                  </span>
                </div>

                {loadingOrders ? (
                  <p className="text-xs text-neutral-400 text-center py-6 tracking-wider uppercase">
                    Loading orders...
                  </p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-neutral-200 p-4">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                      No orders placed yet
                    </p>
                    <p className="text-[11px] text-neutral-400 tracking-wide">
                      Your completed orders will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto divide-y divide-neutral-100 border border-neutral-200 pr-1">
                    {orders.map((ord) => (
                      <div key={ord.id} className="p-3 text-xs space-y-1 hover:bg-neutral-50">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-black font-semibold tracking-wider text-[11px]">
                            {ord.order_number}
                          </span>
                          <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.2 font-mono">
                            {ord.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-neutral-500">
                          <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                          <span className="font-semibold text-black">
                            {formatINR(ord.total_amount)}
                          </span>
                        </div>
                        {ord.items && ord.items.length > 0 && (
                          <p className="text-[10px] text-neutral-400 truncate">
                            {ord.items.map((i) => `${i.quantity}x ${i.product_name || `Product #${i.product_id}`}`).join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sign Out Button */}
              <button
                onClick={logout}
                className="w-full py-3 border border-neutral-300 hover:border-black text-black text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>SIGN OUT</span>
              </button>
            </div>
          ) : (
            /* ========================================================================= */
            /* VIEW: AUTHENTICATION (SIGN IN / REGISTER TABS) */
            /* ========================================================================= */
            <div className="space-y-5">
              {/* Tab Selector */}
              <div className="flex border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg("");
                  }}
                  className={`flex-1 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors border-b-2 -mb-px ${
                    mode === "signin"
                      ? "border-black text-black"
                      : "border-transparent text-neutral-400 hover:text-black"
                  }`}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMsg("");
                  }}
                  className={`flex-1 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors border-b-2 -mb-px ${
                    mode === "register"
                      ? "border-black text-black"
                      : "border-transparent text-neutral-400 hover:text-black"
                  }`}
                >
                  REGISTER
                </button>
              </div>

              {/* Form Body */}
              {mode === "signin" ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                      EMAIL ADDRESS *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="client@amorecosmetics.in"
                        className="w-full bg-white border border-neutral-300 p-2.5 pl-9 text-xs uppercase tracking-wider text-black focus:outline-none focus:border-black placeholder:text-neutral-400"
                      />
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                      PASSWORD *
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-neutral-300 p-2.5 pl-9 text-xs tracking-wider text-black focus:outline-none focus:border-black placeholder:text-neutral-400 font-mono"
                      />
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Demo Credential Fillers */}
                  <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-1.5">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
                      QUICK SEEDED DEMO ACCOUNTS:
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={fillDemoClient}
                        className="flex-1 py-1.5 bg-white border border-neutral-200 hover:border-black text-[10px] font-mono uppercase tracking-wider text-black transition-colors"
                      >
                        Client (user123)
                      </button>
                      <button
                        type="button"
                        onClick={fillDemoAdmin}
                        className="flex-1 py-1.5 bg-white border border-neutral-200 hover:border-black text-[10px] font-mono uppercase tracking-wider text-black transition-colors"
                      >
                        Admin (admin123)
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-black text-white text-xs font-medium uppercase tracking-[0.25em] hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-md cursor-pointer"
                  >
                    {isLoading ? "AUTHENTICATING..." : "SIGN IN"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                      FULL NAME *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="PRIYA SHARMA"
                        className="w-full bg-white border border-neutral-300 p-2.5 pl-9 text-xs uppercase tracking-wider text-black focus:outline-none focus:border-black placeholder:text-neutral-400"
                      />
                      <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                      EMAIL ADDRESS *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="priya@example.com"
                        className="w-full bg-white border border-neutral-300 p-2.5 pl-9 text-xs uppercase tracking-wider text-black focus:outline-none focus:border-black placeholder:text-neutral-400"
                      />
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                      PASSWORD (MIN 6 CHARS) *
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-neutral-300 p-2.5 pl-9 text-xs tracking-wider text-black focus:outline-none focus:border-black placeholder:text-neutral-400 font-mono"
                      />
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-black text-white text-xs font-medium uppercase tracking-[0.25em] hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-md cursor-pointer"
                  >
                    {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
