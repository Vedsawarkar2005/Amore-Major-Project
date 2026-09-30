"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Lock,
  KeyRound,
  AlertTriangle,
  Check,
  X,
  Palette,
  ArrowLeft,
  SlidersHorizontal,
  ChevronRight,
  Package,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAdminShades,
  createAdminShade,
  updateAdminShade,
  deleteAdminShade,
  ShadeProduct,
  CreateShadeInput,
} from "@/lib/api";
import { formatINR } from "@/lib/utils";

// Supported finishes for Amore HydraVelvet collection
const FINISH_OPTIONS = [
  "Velvet Matte",
  "Hydrating Satin",
  "Silky Satin",
  "Soft Matte",
  "High Shine Gloss",
  "Sheer Tint",
];

export default function ShadeManagementDashboard() {
  const { user, token, isAuthenticated, isLoading: authLoading, openAuthModal } = useAuth();

  // Catalog state
  const [shades, setShades] = useState<ShadeProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [finishFilter, setFinishFilter] = useState<string>("all");

  // Modal / Drawer states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeShade, setActiveShade] = useState<ShadeProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation state
  const [shadeToDelete, setShadeToDelete] = useState<ShadeProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Form Fields
  const [formData, setFormData] = useState<{
    sku: string;
    shade_name: string;
    hex_code: string;
    price: number | string;
    stock_quantity: number | string;
    finish: string;
    description: string;
    image_url: string;
  }>({
    sku: "",
    shade_name: "",
    hex_code: "#9B111E",
    price: 349,
    stock_quantity: 50,
    finish: "Velvet Matte",
    description: "",
    image_url: "/images/products/hvl001.jpg",
  });

  // Load shades from backend
  const loadShades = async (refresh = false) => {
    if (!token && !user) return;
    if (refresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminShades(token || undefined);
      setShades(data);
    } catch (err: any) {
      console.error("Failed to load shades:", err);
      setError(err.message || "Failed to load shade catalog.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === "admin") {
      loadShades();
    }
  }, [authLoading, isAuthenticated, user, token]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextIndex = shades.length + 1;
    const padded = String(nextIndex).padStart(3, "0");
    setFormData({
      sku: `HVL${padded}`,
      shade_name: "",
      hex_code: "#9B111E",
      price: 349,
      stock_quantity: 50,
      finish: "Velvet Matte",
      description: "",
      image_url: `/images/products/hvl001.jpg`,
    });
    setFormError(null);
    setModalMode("create");
    setActiveShade(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (shade: ShadeProduct) => {
    setFormData({
      sku: shade.sku,
      shade_name: shade.shade_name,
      hex_code: shade.hex_code,
      price: shade.price,
      stock_quantity: shade.stock_quantity,
      finish: shade.finish || "Velvet Matte",
      description: shade.description || "",
      image_url: shade.image_url || "/images/products/hvl001.jpg",
    });
    setFormError(null);
    setModalMode("edit");
    setActiveShade(shade);
    setIsModalOpen(true);
  };

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sku.trim() || !formData.shade_name.trim() || !formData.hex_code.trim()) {
      setFormError("SKU, Shade Name, and Hex Code are mandatory fields.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (modalMode === "create") {
        const payload: CreateShadeInput = {
          sku: formData.sku.toUpperCase().trim(),
          shade_name: formData.shade_name.trim(),
          name: `HydraVelvet Matte Lipstick - ${formData.shade_name.trim()}`,
          hex_code: formData.hex_code.trim(),
          price: Number(formData.price) || 0,
          stock_quantity: Number(formData.stock_quantity) || 0,
          finish: formData.finish,
          description: formData.description.trim(),
          image_url: formData.image_url.trim() || "/images/products/hvl001.jpg",
        };
        const created = await createAdminShade(payload, token || undefined);
        setShades((prev) => [...prev, created]);
      } else if (modalMode === "edit" && activeShade) {
        const payload = {
          sku: formData.sku.toUpperCase().trim(),
          shade_name: formData.shade_name.trim(),
          name: `HydraVelvet Matte Lipstick - ${formData.shade_name.trim()}`,
          hex_code: formData.hex_code.trim(),
          price: Number(formData.price) || 0,
          stock_quantity: Number(formData.stock_quantity) || 0,
          finish: formData.finish,
          description: formData.description.trim(),
          image_url: formData.image_url.trim() || "/images/products/hvl001.jpg",
        };
        const updated = await updateAdminShade(activeShade.id, payload, token || undefined);
        setShades((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to save shade:", err);
      setFormError(err.message || "Failed to save shade.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!shadeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAdminShade(shadeToDelete.id, token || undefined);
      setShades((prev) => prev.filter((s) => s.id !== shadeToDelete.id));
      setShadeToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete shade:", err);
      alert(err.message || "Failed to delete shade.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list
  const filteredShades = useMemo(() => {
    return shades.filter((s) => {
      const matchesSearch =
        !searchQuery.trim() ||
        s.shade_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.hex_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.finish && s.finish.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFinish =
        finishFilter === "all" || (s.finish && s.finish.toLowerCase() === finishFilter.toLowerCase());

      return matchesSearch && matchesFinish;
    });
  }, [shades, searchQuery, finishFilter]);

  // =========================================================================
  // Loading & Unauthenticated States
  // =========================================================================
  if (authLoading) {
    return (
      <div className="min-h-[80vh] bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="w-6 h-6 animate-spin text-neutral-400 mb-3" />
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono">
          Verifying Atelier Clearance...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[85vh] bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-neutral-200 p-8 sm:p-10 text-center space-y-6">
          <div className="w-12 h-12 mx-auto border border-neutral-300 flex items-center justify-center text-neutral-800">
            <Lock className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-neutral-500">RESTRICTED ATELIER</p>
            <h1 className="text-2xl font-serif uppercase tracking-tight text-neutral-900">
              Admin Clearance Required
            </h1>
            <div className="w-8 h-px bg-neutral-300 mx-auto my-3" />
            <p className="text-xs text-neutral-600 font-light leading-relaxed">
              The Shade Atelier oversees the HydraVelvet cosmetic catalog. Please sign in with an
              administrator account to manage formulas and swatches.
            </p>
          </div>
          <button
            onClick={openAuthModal}
            className="w-full py-3.5 bg-black text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" /> Sign In as Administrator
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-[85vh] bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 p-8 text-center space-y-4">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <h2 className="text-xl font-serif uppercase tracking-tight text-neutral-900">
            Access Restricted
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Your account ({user.email}) does not possess administrative privileges for the Shade Atelier.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition"
          >
            Return to Boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white pb-24">
      {/* ===================================================================== */}
      {/* Top Editorial Sub-Header & Navigation */}
      {/* ===================================================================== */}
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
                <Link href="/admin" className="hover:text-black transition-colors">
                  ADMIN CONSOLE
                </Link>
                <span>/</span>
                <span className="text-neutral-900 font-medium">SHADE ATELIER</span>
              </div>

              {/* Title using Amore editorial serif */}
              <h1 className="text-2xl sm:text-4xl font-serif uppercase tracking-tight text-neutral-900">
                Shade Atelier
              </h1>
              <p className="text-xs text-neutral-500 font-light tracking-wide mt-1.5">
                HydraVelvet lipstick palette catalog, color swatches, finishes, and inventory
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-300 hover:border-black text-neutral-700 hover:text-black text-xs uppercase tracking-widest font-medium transition-colors bg-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Console Home</span>
              </Link>

              <button
                onClick={() => loadShades(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-300 hover:border-black text-neutral-700 hover:text-black text-xs uppercase tracking-widest font-medium transition-colors bg-white disabled:opacity-50"
                title="Reload catalog"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Sync</span>
              </button>

              {/* Minimalist Primary Action Button */}
              <button
                onClick={handleOpenCreate}
                className="bg-neutral-900 text-white px-6 py-2 text-sm uppercase tracking-widest hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Shade</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* Main Content Container */}
      {/* ===================================================================== */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-white border border-red-300 text-red-700 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadShades(true)}
              className="px-3 py-1 bg-red-50 border border-red-200 hover:bg-red-100 text-[10px] uppercase tracking-wider font-semibold transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 p-5 space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400">Total Shades</span>
            <div className="text-2xl font-serif text-neutral-900">{shades.length}</div>
          </div>
          <div className="bg-white border border-neutral-200 p-5 space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400">Velvet Matte</span>
            <div className="text-2xl font-serif text-neutral-900">
              {shades.filter((s) => s.finish === "Velvet Matte").length}
            </div>
          </div>
          <div className="bg-white border border-neutral-200 p-5 space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400">Satin Formulations</span>
            <div className="text-2xl font-serif text-neutral-900">
              {shades.filter((s) => s.finish?.toLowerCase().includes("satin")).length}
            </div>
          </div>
          <div className="bg-white border border-neutral-200 p-5 space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400">Low Stock (&le; 20)</span>
            <div className="text-2xl font-serif text-amber-700">
              {shades.filter((s) => s.stock_quantity <= 20).length}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by shade name, SKU, or hex code..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 whitespace-nowrap">
              Finish:
            </label>
            <select
              value={finishFilter}
              onChange={(e) => setFinishFilter(e.target.value)}
              className="bg-white border border-neutral-200 text-xs px-3 py-2.5 text-neutral-800 focus:outline-none focus:border-neutral-900 transition-colors uppercase tracking-wider"
            >
              <option value="all">All Finishes</option>
              {FINISH_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* Task 2: The Shade Inventory Table (Flat Card Enclosure) */}
        {/* ===================================================================== */}
        <div className="border border-neutral-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#FAF8F5]/80">
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-neutral-500 font-medium">
                    Color
                  </th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-neutral-500 font-medium">
                    Shade Name
                  </th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-neutral-500 font-medium">
                    SKU
                  </th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-neutral-500 font-medium">
                    Finish
                  </th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-neutral-500 font-medium">
                    Price
                  </th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-neutral-500 font-medium">
                    Stock
                  </th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-neutral-500 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-neutral-400 font-light uppercase tracking-widest">
                      <RefreshCw className="w-4 h-4 mx-auto animate-spin mb-3 text-neutral-400" />
                      Loading HydraVelvet palette...
                    </td>
                  </tr>
                ) : filteredShades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-neutral-400 font-light tracking-wide">
                      No shades found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredShades.map((shade) => {
                    const isLowStock = shade.stock_quantity <= 20;
                    const isOut = shade.stock_quantity === 0;

                    return (
                      <tr
                        key={shade.id}
                        className="border-b border-neutral-100 hover:bg-[#FAF8F5]/80 transition-colors"
                      >
                        {/* Visual Swatch Cell */}
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-6 h-6 rounded-full border border-neutral-200 shadow-sm shrink-0 transition-transform hover:scale-110"
                              style={{ backgroundColor: shade.hex_code }}
                              title={`Swatch: ${shade.shade_name} (${shade.hex_code})`}
                            />
                            <span className="font-mono text-[11px] text-neutral-600 uppercase">
                              {shade.hex_code}
                            </span>
                          </div>
                        </td>

                        {/* Shade Name */}
                        <td className="py-5 px-6">
                          <div className="font-medium text-neutral-900 text-sm">
                            {shade.shade_name}
                          </div>
                          {shade.description && (
                            <div className="text-[11px] text-neutral-400 line-clamp-1 max-w-xs mt-0.5">
                              {shade.description}
                            </div>
                          )}
                        </td>

                        {/* SKU */}
                        <td className="py-5 px-6 font-mono text-neutral-500 text-[11px]">
                          {shade.sku}
                        </td>

                        {/* Finish Badges */}
                        <td className="py-5 px-6">
                          <span className="bg-neutral-50 text-neutral-600 px-2 py-1 text-[10px] rounded-sm uppercase border border-neutral-200 tracking-wider inline-block">
                            {shade.finish || "Velvet Matte"}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-5 px-6 font-mono text-neutral-900 font-medium">
                          {formatINR(shade.price)}
                        </td>

                        {/* Stock Units & Meter */}
                        <td className="py-5 px-6">
                          <div className="space-y-1 max-w-[120px]">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span
                                className={
                                  isOut
                                    ? "text-red-600 font-semibold"
                                    : isLowStock
                                    ? "text-amber-700 font-semibold"
                                    : "text-neutral-700"
                                }
                              >
                                {shade.stock_quantity} units
                              </span>
                            </div>
                            <div className="w-full h-1 bg-neutral-100 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isOut
                                    ? "bg-red-500"
                                    : isLowStock
                                    ? "bg-amber-500"
                                    : "bg-neutral-900"
                                }`}
                                style={{
                                  width: `${Math.min(100, Math.max(0, shade.stock_quantity))}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Action Menu (Task 3: Minimalist Low-Contrast Text Links) */}
                        <td className="py-5 px-6 text-right">
                          <div className="inline-flex items-center gap-4 text-xs">
                            <button
                              onClick={() => handleOpenEdit(shade)}
                              className="text-neutral-400 hover:text-black transition-colors underline decoration-1 underline-offset-4 cursor-pointer"
                            >
                              Edit
                            </button>
                            <span className="text-neutral-200">/</span>
                            <button
                              onClick={() => setShadeToDelete(shade)}
                              className="text-neutral-400 hover:text-black transition-colors underline decoration-1 underline-offset-4 cursor-pointer"
                            >
                              Delete
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

          {/* Table Footer info */}
          <div className="px-6 py-4 bg-[#FAF8F5]/40 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500 font-mono">
            <span>
              Showing {filteredShades.length} of {shades.length} shade formulations
            </span>
            <span className="text-[11px]">Formula: HydraVelvet Matte Lipstick Core</span>
          </div>
        </div>
      </main>

      {/* ===================================================================== */}
      {/* Task 3: Modal / Slide-Out Form with Thin Bottom Borders */}
      {/* ===================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-neutral-200 max-w-xl w-full p-8 sm:p-10 shadow-2xl animate-in fade-in duration-200 relative my-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
              <div>
                <h3 className="font-serif uppercase tracking-tight text-neutral-900 text-xl">
                  {modalMode === "create" ? "Add New Shade" : "Edit Shade Formulation"}
                </h3>
                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-1">
                  {modalMode === "create"
                    ? "Expand the Amore HydraVelvet repertoire"
                    : `Modify details for ${activeShade?.sku}`}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-black transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error in form */}
            {formError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            {/* Editorial Form */}
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* SKU */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
                    SKU Identification *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. HVL013"
                    className="w-full py-2 border-b border-neutral-300 rounded-none bg-transparent focus:border-neutral-900 outline-none text-xs font-mono uppercase tracking-wider text-neutral-900 transition-colors"
                  />
                </div>

                {/* Shade Name */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
                    Shade Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shade_name}
                    onChange={(e) => setFormData({ ...formData, shade_name: e.target.value })}
                    placeholder="e.g. Crimson Velvet"
                    className="w-full py-2 border-b border-neutral-300 rounded-none bg-transparent focus:border-neutral-900 outline-none text-xs tracking-wide text-neutral-900 transition-colors"
                  />
                </div>
              </div>

              {/* Color Swatch & Hex */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
                    Color Hex Code *
                  </label>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full border border-neutral-300 shadow-sm shrink-0"
                      style={{ backgroundColor: formData.hex_code }}
                    />
                    <input
                      type="text"
                      required
                      value={formData.hex_code}
                      onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                      placeholder="#9B111E"
                      className="w-full py-2 border-b border-neutral-300 rounded-none bg-transparent focus:border-neutral-900 outline-none text-xs font-mono uppercase tracking-wider text-neutral-900 transition-colors"
                    />
                  </div>
                </div>

                {/* Native Color Picker */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
                    Palette Picker
                  </label>
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="color"
                      value={formData.hex_code.startsWith("#") ? formData.hex_code : "#9B111E"}
                      onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                      className="h-7 w-12 border border-neutral-300 cursor-pointer bg-white"
                    />
                    <span className="text-[11px] text-neutral-400 font-mono">Select tone</span>
                  </div>
                </div>
              </div>

              {/* Finish & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
                    Product Finish
                  </label>
                  <select
                    value={formData.finish}
                    onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                    className="w-full py-2 border-b border-neutral-300 rounded-none bg-transparent focus:border-neutral-900 outline-none text-xs tracking-wide text-neutral-900 transition-colors cursor-pointer"
                  >
                    {FINISH_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
                    Price (INR &#8377;) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full py-2 border-b border-neutral-300 rounded-none bg-transparent focus:border-neutral-900 outline-none text-xs font-mono text-neutral-900 transition-colors"
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full py-2 border-b border-neutral-300 rounded-none bg-transparent focus:border-neutral-900 outline-none text-xs font-mono text-neutral-900 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
                    Asset Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="/images/products/hvl001.jpg"
                    className="w-full py-2 border-b border-neutral-300 rounded-none bg-transparent focus:border-neutral-900 outline-none text-xs text-neutral-900 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
                  Editorial Formulation Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Rich, comforting pigment infused with Blueberry Butter and Avocado Oil..."
                  className="w-full py-2 border-b border-neutral-300 rounded-none bg-transparent focus:border-neutral-900 outline-none text-xs text-neutral-900 leading-relaxed transition-colors resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-6 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-neutral-300 text-neutral-700 hover:text-black hover:border-black text-xs uppercase tracking-widest transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-neutral-900 text-white px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? "Saving Formulation..." : modalMode === "create" ? "Create Shade" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* Delete Confirmation Modal */}
      {/* ===================================================================== */}
      {shadeToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white border border-neutral-200 max-w-md w-full p-8 shadow-2xl animate-in fade-in duration-200 text-center space-y-5">
            <div className="w-12 h-12 rounded-full mx-auto border border-neutral-200 flex items-center justify-center">
              <div
                className="w-6 h-6 rounded-full border border-neutral-300 shadow-xs"
                style={{ backgroundColor: shadeToDelete.hex_code }}
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-serif uppercase tracking-tight text-neutral-900 text-lg">
                Archive Shade Formulation?
              </h4>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-neutral-900">
                  {shadeToDelete.shade_name} ({shadeToDelete.sku})
                </span>{" "}
                from the active HydraVelvet catalog? This action will immediately remove it from the
                storefront.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShadeToDelete(null)}
                className="px-5 py-2.5 border border-neutral-300 text-neutral-700 hover:text-black hover:border-black text-xs uppercase tracking-widest font-medium transition-colors"
              >
                Keep Shade
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-widest font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Archiving..." : "Confirm Removal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
