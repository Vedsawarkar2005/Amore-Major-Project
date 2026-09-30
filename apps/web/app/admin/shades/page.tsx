"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Search,
  Check,
  X,
  Palette,
  Tag,
  Layers,
} from "lucide-react";

import {
  Shade,
  useShades,
  addShade,
  updateShade,
  deleteShade,
  resetShadesToDefault,
} from "@/lib/shades/shadesStore";
import { FinishType } from "@/lib/tryon/lips/realistic-lipstickRenderer";

// Zod validation schema as per requirements
const shadeSchema = z.object({
  name: z.string().min(1, "Shade name is required"),
  hex: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6})$/, "Must be a valid hex color code (e.g. #FF0055)"),
  finish: z.enum(["Velvet Matte", "Matte", "Satin", "Glossy"]),
  price: z.string().optional(),
  sku: z.string().optional(),
});

export default function AdminShadesPage() {
  const { shades, loaded } = useShades();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFinish, setFilterFinish] = useState<string>("ALL");

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShade, setEditingShade] = useState<Shade | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Form setup using @tanstack/react-form
  const form = useForm({
    defaultValues: {
      name: editingShade?.name || "",
      hex: editingShade?.hex || "#8C3725",
      finish: editingShade?.finish || "Velvet Matte",
      price: editingShade?.price !== undefined ? String(editingShade.price) : "349",
      sku: editingShade?.sku || "",
    },
    onSubmit: async ({ value }) => {
      const result = shadeSchema.safeParse(value);
      if (!result.success) {
        return;
      }

      if (editingShade) {
        updateShade(editingShade.id, value as Omit<Shade, "id">);
        showToast(`Shade "${value.name}" updated successfully!`);
      } else {
        addShade(value as Omit<Shade, "id">);
        showToast(`Shade "${value.name}" added successfully!`);
      }

      closeForm();
    },
  });

  const openAddForm = () => {
    setEditingShade(null);
    form.reset();
    form.setFieldValue("name", "");
    form.setFieldValue("hex", "#8C3725");
    form.setFieldValue("finish", "Velvet Matte");
    form.setFieldValue("price", "349");
    form.setFieldValue("sku", `HVL${Math.floor(Math.random() * 900 + 100)}`);
    setIsFormOpen(true);
  };

  const openEditForm = (shade: Shade) => {
    setEditingShade(shade);
    form.reset();
    form.setFieldValue("name", shade.name);
    form.setFieldValue("hex", shade.hex);
    form.setFieldValue("finish", shade.finish);
    form.setFieldValue("price", shade.price !== undefined ? String(shade.price) : "");
    form.setFieldValue("sku", shade.sku || "");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingShade(null);
  };

  const handleDelete = (id: string, name: string) => {
    deleteShade(id);
    setDeleteConfirmId(null);
    showToast(`Shade "${name}" deleted.`);
  };

  const handleReset = () => {
    if (window.confirm("Reset all shades to official company defaults (12 Amore HydraVelvet shades)?")) {
      resetShadesToDefault();
      showToast("Reset to official company shade catalog (12 Amore HydraVelvet shades).");
    }
  };

  const filteredShades = shades.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hex.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.sku && s.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFinish = filterFinish === "ALL" || s.finish === filterFinish;
    return matchesSearch && matchesFinish;
  });

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <p className="text-lg animate-pulse">Loading shade inventory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header Bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <h1 className="text-xl font-bold font-serif tracking-tight text-white">
                Admin Shade Catalog
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
              title="Reset catalog to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 transition"
            >
              <Plus className="w-4 h-4" /> Add New Shade
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toastMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-rose-400" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)}>
              <X className="w-4 h-4 text-rose-400 hover:text-rose-200" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Total Shades</p>
              <p className="text-2xl font-bold text-white">{shades.length}</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Velvet Matte</p>
              <p className="text-2xl font-bold text-white">
                {shades.filter((s) => s.finish === "Velvet Matte" || s.finish === "Matte").length}
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-violet-950 border border-violet-800 flex items-center justify-center text-violet-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Satin Finishes</p>
              <p className="text-2xl font-bold text-white">
                {shades.filter((s) => s.finish === "Satin").length}
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-pink-950 border border-pink-800 flex items-center justify-center text-pink-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Glossy Finishes</p>
              <p className="text-2xl font-bold text-white">
                {shades.filter((s) => s.finish === "Glossy").length}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search shade name, hex, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs text-zinc-400 whitespace-nowrap">Filter Finish:</span>
            {["ALL", "Velvet Matte", "Matte", "Satin", "Glossy"].map((finish) => (
              <button
                key={finish}
                onClick={() => setFilterFinish(finish)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filterFinish === finish
                    ? "bg-rose-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {finish}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Swatch</th>
                <th className="py-3.5 px-4">Shade Name</th>
                <th className="py-3.5 px-4">Hex Code</th>
                <th className="py-3.5 px-4">Finish</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm">
              {filteredShades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No matching lipstick shades found.
                  </td>
                </tr>
              ) : (
                filteredShades.map((shade) => (
                  <tr
                    key={shade.id}
                    className="hover:bg-zinc-800/40 transition group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border border-zinc-700 shadow-md transform group-hover:scale-105 transition"
                          style={{ backgroundColor: shade.hex }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-100">
                      {shade.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-xs">
                      {shade.hex.toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          shade.finish === "Velvet Matte" || shade.finish === "Matte"
                            ? "bg-rose-950/80 border-rose-800 text-rose-300"
                            : shade.finish === "Satin"
                            ? "bg-indigo-950/80 border-indigo-800 text-indigo-300"
                            : "bg-pink-950/80 border-pink-800 text-pink-300"
                        }`}
                      >
                        {shade.finish}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      {typeof shade.price === "number" ? `₹${shade.price}` : shade.price || "₹349"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-500">
                      {shade.sku || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {deleteConfirmId === shade.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(shade.id, shade.name)}
                            className="px-2.5 py-1 text-xs rounded bg-red-600 text-white font-medium hover:bg-red-500 transition"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditForm(shade)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition"
                            title="Edit Shade"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(shade.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition"
                            title="Delete Shade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
              <h2 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                {editingShade ? "Edit Lipstick Shade" : "Add New Lipstick Shade"}
              </h2>
              <button
                onClick={closeForm}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-5"
            >
              {/* Name */}
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) => {
                    const res = shadeSchema.shape.name.safeParse(value);
                    return res.success ? undefined : res.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Shade Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Brick Brown"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-rose-400 mt-1">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Hex */}
              <form.Field
                name="hex"
                validators={{
                  onChange: ({ value }) => {
                    const res = shadeSchema.shape.hex.safeParse(value);
                    return res.success ? undefined : res.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Hex Color Code *
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={
                          /^#([A-Fa-f0-9]{6})$/.test(field.state.value)
                            ? field.state.value
                            : "#8C3725"
                        }
                        onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                        className="w-10 h-10 rounded-lg border border-zinc-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="#8C3725"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                        onBlur={field.handleBlur}
                        className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition"
                      />
                      <div
                        className="w-8 h-8 rounded-full border border-zinc-700 shadow-inner flex-shrink-0"
                        style={{
                          backgroundColor: /^#([A-Fa-f0-9]{6})$/.test(field.state.value)
                            ? field.state.value
                            : "transparent",
                        }}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-rose-400 mt-1">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Finish */}
              <form.Field name="finish">
                {(field) => (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Finish / Texture *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(["Velvet Matte", "Matte", "Satin", "Glossy"] as FinishType[]).map((finishOption) => (
                        <button
                          key={finishOption}
                          type="button"
                          onClick={() => field.handleChange(finishOption)}
                          className={`py-2 px-1 text-center rounded-lg text-xs font-semibold border transition ${
                            field.state.value === finishOption
                              ? "bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-950/40"
                              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {finishOption}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Price & SKU */}
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="price">
                  {(field) => (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Price (₹)
                      </label>
                      <input
                        type="text"
                        placeholder="349"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="sku">
                  {(field) => (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        SKU
                      </label>
                      <input
                        type="text"
                        placeholder="HVL001"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition"
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="px-5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 transition shadow-lg shadow-rose-900/30"
                    >
                      {editingShade ? "Save Changes" : "Create Shade"}
                    </button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
