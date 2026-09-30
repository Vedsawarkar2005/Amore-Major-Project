import React from "react";
import { Users, ShoppingBag, TrendingUp, AlertTriangle, Shield } from "lucide-react";
import { AdminMetrics } from "@/lib/api";
import { formatINR } from "@/lib/utils";

interface AdminKpiCardsProps {
  metrics: AdminMetrics | null;
  loadingData: boolean;
  usersCount: number;
  recentOrdersCount: number;
}

export const AdminKpiCards: React.FC<AdminKpiCardsProps> = ({
  metrics,
  loadingData,
  usersCount,
  recentOrdersCount,
}) => {
  return (
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
            {metrics?.total_users ?? metrics?.totalUsers ?? (loadingData ? "—" : usersCount)}
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
          <span>{recentOrdersCount} recent orders recorded</span>
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
  );
};

export default AdminKpiCards;
