"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Search,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Database,
  ExternalLink,
  Layers,
  KeyRound,
  FileCode2,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAdminUsers,
  fetchAdminMetrics,
  AdminUser,
  AdminMetrics,
  AdminRecentOrder,
  AdminInventoryProduct,
} from "@/lib/api";
import { formatINR } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { user, token, isAuthenticated, isLoading: authLoading, openAuthModal, logout } = useAuth();

  // Data states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<"security" | "orders" | "inventory">("security");

  // Security Panel State: Per-row reveal toggle (User ID -> boolean)
  const [revealedUsers, setRevealedUsers] = useState<Record<number, boolean>>({});
  const [revealAll, setRevealAll] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Inspector modal state for deep cryptographic payload inspection
  const [inspectedUser, setInspectedUser] = useState<AdminUser | null>(null);

  // Filter states
  const [userSearch, setUserSearch] = useState<string>("");
  const [orderSearch, setOrderSearch] = useState<string>("");
  const [inventorySearch, setInventorySearch] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "in_stock">("all");

  // Load telemetry data from backend
  const loadData = async (isRefresh = false) => {
    if (!token && !user) return;
    if (isRefresh) setIsRefreshing(true);
    else setLoadingData(true);
    setDataError(null);

    try {
      const [usersData, metricsData] = await Promise.all([
        fetchAdminUsers(token || undefined),
        fetchAdminMetrics(token || undefined),
      ]);
      setUsers(usersData);
      setMetrics(metricsData);
    } catch (err: any) {
      console.error("Failed to load admin data:", err);
      setDataError(err.message || "Failed to load admin telemetry from backend");
    } finally {
      setLoadingData(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === "admin") {
      loadData();
    }
  }, [authLoading, isAuthenticated, user, token]);

  // Copy helper with feedback
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Toggle single user's reveal state
  const toggleRevealUser = (userId: number) => {
    setRevealedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Toggle global reveal state
  const toggleRevealAll = () => {
    const nextState = !revealAll;
    setRevealAll(nextState);
    const updated: Record<number, boolean> = {};
    users.forEach((u) => {
      updated[u.id] = nextState;
    });
    setRevealedUsers(updated);
  };

  // Parse AES-256-GCM payload parts (iv:authTag:ciphertext)
  const parsePayload = (payload: string | null) => {
    if (!payload || !payload.includes(":")) {
      return { iv: null, authTag: null, ciphertext: payload };
    }
    const parts = payload.split(":");
    return {
      iv: parts[0] || null,
      authTag: parts[1] || null,
      ciphertext: parts[2] || null,
    };
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return (
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        String(u.id).includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.address && u.address.toLowerCase().includes(q)) ||
        (u.encrypted_phone && u.encrypted_phone.toLowerCase().includes(q)) ||
        (u.encrypted_address && u.encrypted_address.toLowerCase().includes(q))
      );
    });
  }, [users, userSearch]);

  // Filtered orders
  const recentOrders: AdminRecentOrder[] = metrics?.recent_orders || metrics?.recentOrders || [];
  const filteredOrders = useMemo(() => {
    return recentOrders.filter((o) => {
      if (!orderSearch.trim()) return true;
      const q = orderSearch.toLowerCase();
      return (
        String(o.id).includes(q) ||
        (o.user_email && o.user_email.toLowerCase().includes(q)) ||
        (o.status && o.status.toLowerCase().includes(q))
      );
    });
  }, [recentOrders, orderSearch]);

  // Filtered inventory
  const inventory: AdminInventoryProduct[] = metrics?.inventory || [];
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        !inventorySearch.trim() ||
        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.shade_name.toLowerCase().includes(inventorySearch.toLowerCase());

      const isLow = item.stock_quantity <= 20;
      if (stockFilter === "low") return matchesSearch && isLow;
      if (stockFilter === "in_stock") return matchesSearch && !isLow && item.stock_quantity > 0;
      return matchesSearch;
    });
  }, [inventory, inventorySearch, stockFilter]);

  // =========================================================================
  // 1. Loading Authentication State
  // =========================================================================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-neutral-800">
        <div className="relative w-12 h-12 flex items-center justify-center mb-6">
          <div className="w-10 h-10 rounded-full border border-neutral-300 border-t-black animate-spin" />
        </div>
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-sans mb-1">
          AMORE ATELIER
        </p>
        <p className="font-serif uppercase tracking-tight text-neutral-900 text-lg">
          Verifying Security Clearance...
        </p>
      </div>
    );
  }

  // =========================================================================
  // 2. Unauthenticated Visitor State
  // =========================================================================
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[85vh] bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-neutral-200 p-8 sm:p-10 text-center space-y-6">
          <div className="w-12 h-12 mx-auto border border-neutral-300 flex items-center justify-center text-neutral-800">
            <Lock className="w-5 h-5 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              RESTRICTED DIRECTORY
            </p>
            <h1 className="text-2xl font-serif uppercase tracking-tight text-neutral-900">
              Admin Clearance Required
            </h1>
            <div className="w-8 h-px bg-neutral-300 mx-auto my-3" />
            <p className="text-xs text-neutral-600 font-light leading-relaxed">
              This console inspects live Neon PostgreSQL database records and AES-256-GCM encrypted
              customer payloads. Please authenticate with an administrative credential to proceed.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={openAuthModal}
              className="w-full py-3.5 bg-black text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" /> Sign In as Administrator
            </button>

            <Link
              href="/"
              className="block w-full py-3.5 border border-neutral-300 text-neutral-700 hover:text-black hover:border-black text-xs uppercase tracking-[0.2em] font-medium transition-colors"
            >
              Return to Boutique
            </Link>
          </div>

          <div className="pt-4 border-t border-neutral-100 text-left">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
              Seeded Admin Credentials:
            </p>
            <div className="p-3 bg-neutral-50 border border-neutral-200 font-mono text-[11px] text-neutral-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-400">Email:</span>
                <span className="font-semibold text-neutral-900">admin@amorecosmetics.in</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Password:</span>
                <span className="text-neutral-900">admin123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. Non-Admin Authenticated User State (403 Forbidden)
  // =========================================================================
  if (user.role !== "admin") {
    return (
      <div className="min-h-[85vh] bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-neutral-200 p-8 sm:p-10 text-center space-y-6">
          <div className="w-12 h-12 mx-auto border border-neutral-300 flex items-center justify-center text-neutral-700">
            <ShieldAlert className="w-5 h-5 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              403 FORBIDDEN • ACCESS DENIED
            </p>
            <h1 className="text-2xl font-serif uppercase tracking-tight text-neutral-900">
              Admin Privileges Required
            </h1>
            <div className="w-8 h-px bg-neutral-300 mx-auto my-3" />
            <p className="text-xs text-neutral-600 font-light leading-relaxed">
              Your account (<strong className="font-normal text-neutral-900">{user.email}</strong>) has{" "}
              <span className="uppercase font-mono text-neutral-800">{user.role}</span> privileges. Access to
              encrypted customer PII, cryptographic keys, and database telemetry is restricted to store administrators.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                logout();
                openAuthModal();
              }}
              className="w-full py-3.5 bg-black text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" /> Re-authenticate as Admin
            </button>

            <Link
              href="/"
              className="block w-full py-3.5 border border-neutral-300 text-neutral-700 hover:text-black hover:border-black text-xs uppercase tracking-[0.2em] font-medium transition-colors"
            >
              Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. Admin Dashboard Main View (Amore Luxury Editorial Styling)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white pb-24">
      {/* Editorial Header Section */}
      <section className="border-b border-neutral-200 bg-white/70 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              {/* Breadcrumb / Label */}
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 mb-2">
                <Link href="/" className="hover:text-black transition-colors">
                  HOME
                </Link>
                <span>/</span>
                <span className="text-neutral-400">ATELIER</span>
                <span>/</span>
                <span className="text-neutral-900 font-medium">ADMINISTRATION</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-serif uppercase tracking-tight text-neutral-900">
                Admin Console & Cryptography
              </h1>
              <p className="text-xs text-neutral-500 font-light tracking-wide mt-1.5">
                Neon PostgreSQL Telemetry & AES-256-GCM Data Decryption Viewer
              </p>
            </div>

            {/* Badges & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-600 text-[10px] uppercase tracking-wider rounded-sm font-mono border border-neutral-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                NEON POSTGRES: CONNECTED
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-600 text-[10px] uppercase tracking-wider rounded-sm font-mono border border-neutral-200">
                <Lock className="w-3 h-3 stroke-[2]" />
                AES-256-GCM
              </span>

              <Link
                href="/admin/shades"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-neutral-300 hover:border-black text-neutral-700 hover:text-black text-xs uppercase tracking-widest font-medium transition-colors bg-white"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Shades</span>
              </Link>

              <button
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-white hover:bg-neutral-800 text-xs uppercase tracking-widest font-medium transition-colors disabled:opacity-50"
                title="Synchronize database telemetry"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Sync</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Centered Spacious Container */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        {/* Error Alert if any */}
        {dataError && (
          <div className="p-4 bg-white border border-red-300 text-red-700 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{dataError}</span>
            </div>
            <button
              onClick={() => loadData(true)}
              className="px-3 py-1 bg-red-50 border border-red-200 hover:bg-red-100 text-[10px] uppercase tracking-wider font-semibold transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* KPI Metrics: Flat Warm Cards with Subtle Hairline Borders */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Registered Users */}
          <div className="bg-white border border-neutral-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-neutral-500">
                Registered Users
              </span>
              <Users className="w-4 h-4 text-neutral-400 stroke-[1.5]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-serif text-neutral-900 font-light">
                {metrics?.total_users ?? metrics?.totalUsers ?? (loadingData ? "—" : users.length)}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                Accounts
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-light tracking-wide flex items-center gap-1.5 pt-1 border-t border-neutral-100">
              <Shield className="w-3 h-3 text-neutral-400" />
              <span>AES-256 encrypted fields</span>
            </p>
          </div>

          {/* Total Orders */}
          <div className="bg-white border border-neutral-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-neutral-500">
                Total Orders
              </span>
              <ShoppingBag className="w-4 h-4 text-neutral-400 stroke-[1.5]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-serif text-neutral-900 font-light">
                {metrics?.total_orders ?? metrics?.totalOrders ?? (loadingData ? "—" : 0)}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                Lifetime
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-light tracking-wide pt-1 border-t border-neutral-100">
              <span>{recentOrders.length} recent orders recorded</span>
            </p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white border border-neutral-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-neutral-500">
                Total Revenue
              </span>
              <TrendingUp className="w-4 h-4 text-neutral-400 stroke-[1.5]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-serif text-neutral-900 font-light">
                {metrics?.total_revenue !== undefined
                  ? formatINR(metrics.total_revenue)
                  : metrics?.totalRevenue !== undefined
                  ? formatINR(metrics.totalRevenue)
                  : loadingData
                  ? "—"
                  : "₹0"}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-light tracking-wide pt-1 border-t border-neutral-100">
              <span>Gross settled order volume</span>
            </p>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white border border-neutral-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-neutral-500">
                Low Stock Alerts
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-500 stroke-[1.5]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-serif text-neutral-900 font-light">
                {metrics?.low_stock_products ?? metrics?.lowStockProducts ?? (loadingData ? "—" : 0)}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                Items ≤ 20
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-light tracking-wide pt-1 border-t border-neutral-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Real-time catalog stock</span>
            </p>
          </div>
        </div>

        {/* ================================================================= */}
        {/* Navigation Tabs (Minimalist Luxury Styling) */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-3">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("security")}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-medium transition-all whitespace-nowrap ${
                activeTab === "security"
                  ? "bg-black text-white"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-100"
              }`}
            >
              Security & Cryptography ({users.length})
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-medium transition-all whitespace-nowrap ${
                activeTab === "orders"
                  ? "bg-black text-white"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-100"
              }`}
            >
              Recent Orders ({recentOrders.length})
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-medium transition-all whitespace-nowrap ${
                activeTab === "inventory"
                  ? "bg-black text-white"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-100"
              }`}
            >
              Inventory & Stock ({inventory.length})
            </button>
          </div>

          <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-mono">
            Signed in as: <span className="text-black font-semibold">{user.email}</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: SECURITY & CRYPTOGRAPHY PANEL */}
        {/* ================================================================= */}
        {activeTab === "security" && (
          <section className="space-y-8">
            {/* Informational Header Card */}
            <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif uppercase tracking-tight text-neutral-900 text-lg sm:text-xl">
                      Zero-Trust Column Cryptography
                    </h2>
                    <span className="bg-neutral-100 text-neutral-600 px-2 py-1 text-[10px] rounded-sm uppercase tracking-wider font-mono">
                      AES-256-GCM
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 font-light leading-relaxed max-w-3xl">
                    Sensitive customer PII (phone number, shipping address) is encrypted before storage.
                    PostgreSQL stores opaque ciphertexts formatted as{" "}
                    <code className="font-mono text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded text-[11px]">
                      iv:authTag:ciphertext
                    </code>
                    . Use the interactive toggles below to visually contrast data at rest in PostgreSQL versus
                    plaintext decoded in Node.js server memory.
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <button
                    onClick={toggleRevealAll}
                    className="text-xs uppercase tracking-widest text-neutral-600 hover:text-black underline decoration-1 underline-offset-4 transition-colors font-medium cursor-pointer"
                  >
                    {revealAll ? "Conceal All Plaintext" : "Reveal All Plaintext"}
                  </button>
                </div>
              </div>
            </div>

            {/* User Search & Stats Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="SEARCH USERS OR CIPHERTEXT..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 text-xs text-black placeholder:text-neutral-400 uppercase tracking-wider focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="text-xs uppercase tracking-widest text-neutral-500 font-mono">
                Showing {filteredUsers.length} of {users.length} accounts
              </div>
            </div>

            {/* Cryptography Data Table */}
            <div className="bg-white border border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/80 text-xs uppercase tracking-widest text-neutral-500 font-sans">
                      <th className="py-4 px-6 font-medium">Account / User</th>
                      <th className="py-4 px-6 font-medium">Role</th>
                      <th className="py-4 px-6 font-medium min-w-[320px]">
                        Phone (PostgreSQL Storage vs Memory)
                      </th>
                      <th className="py-4 px-6 font-medium min-w-[340px]">
                        Address (PostgreSQL Storage vs Memory)
                      </th>
                      <th className="py-4 px-6 font-medium text-right">Plaintext</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {loadingData ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-neutral-400 font-light uppercase tracking-widest">
                          <RefreshCw className="w-4 h-4 mx-auto animate-spin mb-3 text-neutral-400" />
                          Querying Neon PostgreSQL Encrypted Catalog...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-neutral-400 font-light tracking-wide">
                          No registered user records match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isRevealed = !!revealedUsers[u.id];
                        const phoneParts = parsePayload(u.encrypted_phone);
                        const addressParts = parsePayload(u.encrypted_address);

                        return (
                          <tr
                            key={u.id}
                            className="border-b border-neutral-100 hover:bg-[#FAF8F5]/80 transition-colors"
                          >
                            {/* Account / User */}
                            <td className="py-5 px-6 align-top">
                              <div className="font-mono text-[11px] text-neutral-400">ID #{u.id}</div>
                              <div className="font-medium text-neutral-900 text-sm mt-0.5">{u.email}</div>
                              <div className="text-[10px] uppercase font-mono text-neutral-400 mt-1">
                                {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Registered"}
                              </div>
                            </td>

                            {/* Role */}
                            <td className="py-5 px-6 align-top">
                              <span className="inline-block bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] rounded-sm uppercase tracking-wider font-mono border border-neutral-200">
                                {u.role}
                              </span>
                            </td>

                            {/* Phone Comparison View */}
                            <td className="py-5 px-6 align-top">
                              {!u.encrypted_phone ? (
                                <span className="text-neutral-400 font-mono text-xs italic">
                                  Not provided
                                </span>
                              ) : isRevealed ? (
                                /* Plaintext Revealed State */
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider">
                                      <Unlock className="w-2.5 h-2.5" /> Plaintext (Decrypted)
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleCopy(u.phone || u.decrypted_phone || "", `phone-${u.id}`)
                                      }
                                      className="text-neutral-400 hover:text-black transition-colors text-[10px] uppercase font-mono flex items-center gap-1"
                                      title="Copy plaintext"
                                    >
                                      {copiedId === `phone-${u.id}` ? (
                                        <span className="text-emerald-700 flex items-center gap-0.5">
                                          <Check className="w-3 h-3" /> Copied
                                        </span>
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                  <div className="p-2.5 bg-neutral-50 border border-neutral-200 text-neutral-900 font-mono text-xs font-medium">
                                    {u.phone || u.decrypted_phone || "—"}
                                  </div>
                                  <p className="text-[10px] text-neutral-400 font-mono">
                                    Decoded from {u.encrypted_phone.length} bytes in memory
                                  </p>
                                </div>
                              ) : (
                                /* Raw Ciphertext State */
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="bg-neutral-100 text-neutral-600 px-2 py-1 text-[10px] rounded-sm uppercase tracking-wider font-mono border border-neutral-200 inline-flex items-center gap-1">
                                      <Lock className="w-2.5 h-2.5" /> AES-256-GCM
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleCopy(u.encrypted_phone || "", `enc-phone-${u.id}`)
                                      }
                                      className="text-neutral-400 hover:text-black transition-colors text-[10px] uppercase font-mono flex items-center gap-1"
                                      title="Copy ciphertext"
                                    >
                                      {copiedId === `enc-phone-${u.id}` ? (
                                        <span className="text-emerald-700 flex items-center gap-0.5">
                                          <Check className="w-3 h-3" /> Copied
                                        </span>
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                  <div
                                    className="p-2.5 bg-neutral-50 border border-neutral-200 text-neutral-500 font-mono text-[11px] truncate max-w-[320px] select-all cursor-pointer hover:border-neutral-400 transition-colors"
                                    title={u.encrypted_phone}
                                    onClick={() => setInspectedUser(u)}
                                  >
                                    {u.encrypted_phone}
                                  </div>
                                  <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-3">
                                    <span>IV: {phoneParts.iv?.slice(0, 8)}...</span>
                                    <span>Tag: {phoneParts.authTag?.slice(0, 8)}...</span>
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Address Comparison View */}
                            <td className="py-5 px-6 align-top">
                              {!u.encrypted_address ? (
                                <span className="text-neutral-400 font-mono text-xs italic">
                                  Not provided
                                </span>
                              ) : isRevealed ? (
                                /* Plaintext Revealed State */
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider">
                                      <Unlock className="w-2.5 h-2.5" /> Plaintext (Decrypted)
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleCopy(u.address || u.decrypted_address || "", `addr-${u.id}`)
                                      }
                                      className="text-neutral-400 hover:text-black transition-colors text-[10px] uppercase font-mono flex items-center gap-1"
                                      title="Copy plaintext"
                                    >
                                      {copiedId === `addr-${u.id}` ? (
                                        <span className="text-emerald-700 flex items-center gap-0.5">
                                          <Check className="w-3 h-3" /> Copied
                                        </span>
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                  <div className="p-2.5 bg-neutral-50 border border-neutral-200 text-neutral-900 font-mono text-xs font-medium">
                                    {u.address || u.decrypted_address || "—"}
                                  </div>
                                  <p className="text-[10px] text-neutral-400 font-mono">
                                    Decoded from {u.encrypted_address.length} bytes in memory
                                  </p>
                                </div>
                              ) : (
                                /* Raw Ciphertext State */
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="bg-neutral-100 text-neutral-600 px-2 py-1 text-[10px] rounded-sm uppercase tracking-wider font-mono border border-neutral-200 inline-flex items-center gap-1">
                                      <Lock className="w-2.5 h-2.5" /> AES-256-GCM
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleCopy(u.encrypted_address || "", `enc-addr-${u.id}`)
                                      }
                                      className="text-neutral-400 hover:text-black transition-colors text-[10px] uppercase font-mono flex items-center gap-1"
                                      title="Copy ciphertext"
                                    >
                                      {copiedId === `enc-addr-${u.id}` ? (
                                        <span className="text-emerald-700 flex items-center gap-0.5">
                                          <Check className="w-3 h-3" /> Copied
                                        </span>
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                  <div
                                    className="p-2.5 bg-neutral-50 border border-neutral-200 text-neutral-500 font-mono text-[11px] truncate max-w-[340px] select-all cursor-pointer hover:border-neutral-400 transition-colors"
                                    title={u.encrypted_address}
                                    onClick={() => setInspectedUser(u)}
                                  >
                                    {u.encrypted_address}
                                  </div>
                                  <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-3">
                                    <span>IV: {addressParts.iv?.slice(0, 8)}...</span>
                                    <span>Tag: {addressParts.authTag?.slice(0, 8)}...</span>
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Actions Column: Smooth Underline Toggles */}
                            <td className="py-5 px-6 align-top text-right">
                              <div className="flex flex-col items-end gap-2">
                                <button
                                  onClick={() => toggleRevealUser(u.id)}
                                  className="transition-colors hover:text-black text-neutral-400 underline decoration-1 underline-offset-4 text-xs uppercase tracking-wider font-medium cursor-pointer"
                                >
                                  {isRevealed ? "Hide Plaintext" : "Reveal Plaintext"}
                                </button>

                                <button
                                  onClick={() => setInspectedUser(u)}
                                  className="text-[11px] font-mono text-neutral-400 hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <FileCode2 className="w-3 h-3" /> Inspect Hex
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* TAB 2: ORDER OVERVIEW */}
        {/* ================================================================= */}
        {activeTab === "orders" && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="SEARCH ORDERS OR CUSTOMER..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 text-xs text-black placeholder:text-neutral-400 uppercase tracking-wider focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="text-xs uppercase tracking-widest text-neutral-500 font-mono">
                {filteredOrders.length} orders recorded in PostgreSQL
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/80 text-xs uppercase tracking-widest text-neutral-500 font-sans">
                      <th className="py-4 px-6 font-medium">Order ID</th>
                      <th className="py-4 px-6 font-medium">Customer</th>
                      <th className="py-4 px-6 font-medium">Items / Shades</th>
                      <th className="py-4 px-6 font-medium">Total Amount</th>
                      <th className="py-4 px-6 font-medium">Status</th>
                      <th className="py-4 px-6 font-medium text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {loadingData ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-neutral-400 font-light uppercase tracking-widest">
                          <RefreshCw className="w-4 h-4 mx-auto animate-spin mb-3 text-neutral-400" />
                          Querying orders table...
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-neutral-400 font-light tracking-wide">
                          No recent orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-neutral-100 hover:bg-[#FAF8F5]/80 transition-colors"
                        >
                          <td className="py-5 px-6 font-mono font-medium text-neutral-900">
                            #ORD-{order.id.toString().padStart(4, "0")}
                          </td>
                          <td className="py-5 px-6 font-medium text-neutral-800">
                            {order.user_email || `User #${order.user_id}`}
                          </td>
                          <td className="py-5 px-6">
                            {order.items && order.items.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 max-w-sm">
                                {order.items.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-[10px] text-neutral-700 font-mono"
                                  >
                                    {item.hex_code && (
                                      <span
                                        className="w-2 h-2 rounded-full border border-neutral-300"
                                        style={{ backgroundColor: item.hex_code }}
                                      />
                                    )}
                                    <span>{item.product_name || item.product_sku || "Lipstick"}</span>
                                    <span className="text-neutral-400">×{item.quantity}</span>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-neutral-400 font-mono text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-5 px-6 font-mono font-semibold text-neutral-900">
                            {formatINR(order.total_amount)}
                          </td>
                          <td className="py-5 px-6">
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${
                                order.status === "PAID" || order.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {order.status || "PAID"}
                            </span>
                          </td>
                          <td className="py-5 px-6 text-right font-mono text-[11px] text-neutral-500">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleString()
                              : "Just now"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* TAB 3: INVENTORY & STOCK OVERVIEW */}
        {/* ================================================================= */}
        {activeTab === "inventory" && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="SEARCH SHADE OR SKU..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 text-xs text-black placeholder:text-neutral-400 uppercase tracking-wider focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-neutral-500">Filter:</span>
                {(["all", "low", "in_stock"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStockFilter(filter)}
                    className={`px-3 py-1.5 text-xs uppercase tracking-widest font-medium transition-colors ${
                      stockFilter === filter
                        ? "bg-black text-white"
                        : "bg-white border border-neutral-200 text-neutral-600 hover:text-black"
                    }`}
                  >
                    {filter === "all" ? "All (12)" : filter === "low" ? "Low Stock (≤20)" : "Healthy Stock"}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white border border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/80 text-xs uppercase tracking-widest text-neutral-500 font-sans">
                      <th className="py-4 px-6 font-medium">Swatch</th>
                      <th className="py-4 px-6 font-medium">Product / Shade</th>
                      <th className="py-4 px-6 font-medium">SKU</th>
                      <th className="py-4 px-6 font-medium">Finish</th>
                      <th className="py-4 px-6 font-medium">Price</th>
                      <th className="py-4 px-6 font-medium min-w-[200px]">Real-Time Stock</th>
                      <th className="py-4 px-6 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {loadingData ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-neutral-400 font-light uppercase tracking-widest">
                          <RefreshCw className="w-4 h-4 mx-auto animate-spin mb-3 text-neutral-400" />
                          Reading real-time inventory from PostgreSQL...
                        </td>
                      </tr>
                    ) : filteredInventory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-neutral-400 font-light tracking-wide">
                          No products found matching inventory criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredInventory.map((item) => {
                        const isLow = item.stock_quantity <= 20;
                        const isOut = item.stock_quantity === 0;

                        return (
                          <tr
                            key={item.id}
                            className="border-b border-neutral-100 hover:bg-[#FAF8F5]/80 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div
                                className="w-6 h-6 rounded-full border border-neutral-300 shadow-xs"
                                style={{ backgroundColor: item.hex_code }}
                              />
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-medium text-neutral-900">{item.name}</div>
                              <div className="text-[11px] text-neutral-500">{item.shade_name}</div>
                            </td>
                            <td className="py-4 px-6 font-mono text-neutral-500 text-[11px]">
                              {item.sku}
                            </td>
                            <td className="py-4 px-6 text-neutral-700">
                              {item.finish || "Velvet Matte"}
                            </td>
                            <td className="py-4 px-6 font-mono font-medium text-neutral-900">
                              {formatINR(item.price)}
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <span className="text-neutral-700">{item.stock_quantity} units</span>
                                  <span className="text-neutral-400">Max 100</span>
                                </div>
                                <div className="w-full h-1 bg-neutral-100 overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      isOut
                                        ? "bg-red-500"
                                        : isLow
                                        ? "bg-amber-500"
                                        : "bg-black"
                                    }`}
                                    style={{
                                      width: `${Math.min(100, Math.max(0, item.stock_quantity))}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span
                                className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${
                                  isOut
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : isLow
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-neutral-100 text-neutral-700 border-neutral-200"
                                }`}
                              >
                                {isOut ? "Depleted" : isLow ? "Low Stock" : "In Stock"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ===================================================================== */}
      {/* Cryptographic Inspector Modal (Luxury Editorial Styling) */}
      {/* ===================================================================== */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white border border-neutral-200 max-w-2xl w-full p-8 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
              <div>
                <h3 className="font-serif uppercase tracking-tight text-neutral-900 text-lg">
                  Cryptographic Payload Inspector
                </h3>
                <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono mt-0.5">
                  User ID #{inspectedUser.id} • {inspectedUser.email}
                </p>
              </div>
              <button
                onClick={() => setInspectedUser(null)}
                className="p-1 text-neutral-400 hover:text-black transition-colors"
                aria-label="Close inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs font-mono">
              {/* Phone Breakdown */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between text-neutral-900 font-sans uppercase font-medium tracking-wider text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-neutral-600" /> Phone Cryptographic Structure
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">AES-256-GCM</span>
                </div>

                {inspectedUser.encrypted_phone ? (
                  (() => {
                    const { iv, authTag, ciphertext } = parsePayload(inspectedUser.encrypted_phone);
                    return (
                      <div className="space-y-2 text-[11px]">
                        <div>
                          <span className="text-neutral-500 uppercase tracking-wider text-[10px]">
                            Initialization Vector (16 bytes / IV):
                          </span>
                          <div className="p-2 bg-white border border-neutral-200 text-neutral-700 mt-1 break-all">
                            {iv}
                          </div>
                        </div>
                        <div>
                          <span className="text-neutral-500 uppercase tracking-wider text-[10px]">
                            GCM Authentication Tag (16 bytes):
                          </span>
                          <div className="p-2 bg-white border border-neutral-200 text-neutral-700 mt-1 break-all">
                            {authTag}
                          </div>
                        </div>
                        <div>
                          <span className="text-neutral-500 uppercase tracking-wider text-[10px]">
                            AES-256 Ciphertext:
                          </span>
                          <div className="p-2 bg-white border border-neutral-200 text-neutral-700 mt-1 break-all">
                            {ciphertext}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-neutral-200">
                          <span className="text-neutral-900 uppercase tracking-wider text-[10px] font-semibold">
                            Decrypted Plaintext Output:
                          </span>
                          <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 text-emerald-900 font-semibold text-xs mt-1">
                            {inspectedUser.phone || inspectedUser.decrypted_phone || "—"}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-neutral-400 italic">No phone encrypted for this record.</p>
                )}
              </div>

              {/* Address Breakdown */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between text-neutral-900 font-sans uppercase font-medium tracking-wider text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-neutral-600" /> Address Cryptographic Structure
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">AES-256-GCM</span>
                </div>

                {inspectedUser.encrypted_address ? (
                  (() => {
                    const { iv, authTag, ciphertext } = parsePayload(inspectedUser.encrypted_address);
                    return (
                      <div className="space-y-2 text-[11px]">
                        <div>
                          <span className="text-neutral-500 uppercase tracking-wider text-[10px]">
                            Initialization Vector (16 bytes / IV):
                          </span>
                          <div className="p-2 bg-white border border-neutral-200 text-neutral-700 mt-1 break-all">
                            {iv}
                          </div>
                        </div>
                        <div>
                          <span className="text-neutral-500 uppercase tracking-wider text-[10px]">
                            GCM Authentication Tag (16 bytes):
                          </span>
                          <div className="p-2 bg-white border border-neutral-200 text-neutral-700 mt-1 break-all">
                            {authTag}
                          </div>
                        </div>
                        <div>
                          <span className="text-neutral-500 uppercase tracking-wider text-[10px]">
                            AES-256 Ciphertext:
                          </span>
                          <div className="p-2 bg-white border border-neutral-200 text-neutral-700 mt-1 break-all">
                            {ciphertext}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-neutral-200">
                          <span className="text-neutral-900 uppercase tracking-wider text-[10px] font-semibold">
                            Decrypted Plaintext Output:
                          </span>
                          <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 text-emerald-900 font-semibold text-xs mt-1">
                            {inspectedUser.address || inspectedUser.decrypted_address || "—"}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-neutral-400 italic">No address encrypted for this record.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setInspectedUser(null)}
                className="py-2.5 px-6 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
