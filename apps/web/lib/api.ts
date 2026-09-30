import { FALLBACK_PRODUCTS } from './products-fallback';

/**
 * Normalizes the API base URL to ensure consistency regardless of trailing slashes
 * or whether the user entered the root domain or the /api path.
 */
function normalizeApiUrl(raw?: string): string {
  if (!raw || !raw.trim()) {
    return 'http://localhost:8000/api';
  }
  const clean = raw.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export const API_BASE_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);

const TOKEN_KEY = 'amore_auth_token';
const USER_KEY = 'amore_auth_user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

export interface ApiProduct {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  shade_hex: string;
  image_url: string;
  stock: number;
}

import type { Product } from './types';
import { generateProductSlug } from './utils';

/** Map a raw API product to the frontend Product shape */
export function mapApiToProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    name: p.name.startsWith('Hydravelvet') ? p.name : `Hydravelvet Lipstick – ${p.name}`,
    slug: generateProductSlug(p.sku),
    sku: p.sku,
    price: p.price,
    category: "Lips",
    collection: "HydraCream Series",
    image_url: p.image_url,
    shade_name: p.name,
    shade_hex: p.shade_hex || "#9B111E",
    description: p.description || "",
    how_to_use: "",
    ingredients: "",
    in_stock: p.stock > 0,
    is_featured: true,
  };
}

export interface CreateOrderPayload {
  userId: number;
  totalAmount: number;
  shippingAddress: string;
  items: Array<{
    product_id: number;
    quantity: number;
    price: number;
  }>;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name?: string;
  product_sku?: string;
  shade_hex?: string;
  image_url?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
  items?: OrderItem[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Token & User LocalStorage helpers
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}

export function logout(): void {
  removeToken();
  removeStoredUser();
}

// Headers helper
function getHeaders(includeAuth = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

// 1. Fetch Products
export async function fetchProducts(): Promise<ApiProduct[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: getHeaders(false),
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        return data.products;
      }
    }

    // If 404 or not ok, try alternative URL (e.g. without /api or with /api)
    const altBase = API_BASE_URL.endsWith('/api')
      ? API_BASE_URL.slice(0, -4)
      : `${API_BASE_URL}/api`;

    const altRes = await fetch(`${altBase}/products`, {
      method: 'GET',
      headers: getHeaders(false),
      cache: 'no-store',
    });

    if (altRes.ok) {
      const altData = await altRes.json();
      if (Array.isArray(altData.products) && altData.products.length > 0) {
        return altData.products;
      }
    }
  } catch (err) {
    console.warn('Backend API unreachable or sleeping (Render cold-start). Using fallback catalog:', err);
  }

  // Resilient fallback so products are always displayed even during cold-starts or network delays
  return FALLBACK_PRODUCTS;
}

// 2. Fetch Single Product
export async function fetchProductBySku(sku: string): Promise<ApiProduct | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(sku)}`, {
      method: 'GET',
      headers: getHeaders(false),
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.product) return data.product;
    }

    // Try alternate base if first attempt failed
    const altBase = API_BASE_URL.endsWith('/api')
      ? API_BASE_URL.slice(0, -4)
      : `${API_BASE_URL}/api`;

    const altRes = await fetch(`${altBase}/products/${encodeURIComponent(sku)}`, {
      method: 'GET',
      headers: getHeaders(false),
      cache: 'no-store',
    });

    if (altRes.ok) {
      const altData = await altRes.json();
      if (altData.product) return altData.product;
    }
  } catch (err) {
    console.warn(`Backend API unreachable for SKU ${sku}:`, err);
  }

  const fallback = FALLBACK_PRODUCTS.find(
    (p) => p.sku.toLowerCase() === sku.toLowerCase()
  );
  return fallback || null;
}

// 3. User Login
export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to login');
  }

  setToken(data.token);
  setStoredUser(data.user);
  return data;
}

// 4. User Register
export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to register');
  }

  setToken(data.token);
  setStoredUser(data.user);
  return data;
}

// 5. Get Current User Profile
export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: getHeaders(true),
  });

  if (!res.ok) {
    logout();
    return null;
  }

  const data = await res.json();
  if (data.user) {
    setStoredUser(data.user);
    return data.user;
  }
  return null;
}

// 6. Create Order
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({
      user_id: payload.userId,
      total_amount: payload.totalAmount,
      shipping_address: payload.shippingAddress,
      items: payload.items,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to place order');
  }

  return data.order;
}

// 7. Get User Orders
export async function getUserOrders(userId: number): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
    method: 'GET',
    headers: getHeaders(true),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.statusText}`);
  }

  const data = await res.json();
  return data.orders || [];
}

// 8. Virtual Try-On
export interface TryOnResponse {
  status: string;
  shade: string;
  processedUrl: string;
}

export async function processTryOn(
  shadeSku: string,
  imageBase64: string
): Promise<TryOnResponse> {
  const res = await fetch(`${API_BASE_URL}/tryon`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ shadeSku, imageBase64 }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to process try-on');
  }

  return data;
}

// 9. AI Shade Recommendation via Express Backend Gateway (/api/tryon/recommend)
export interface RecommendedShade {
  id: string;
  name: string;
  hex: string;
  finish?: string;
  compatibility: number;
  lab?: {
    L: number;
    a: number;
    b: number;
  };
}

export interface RecommendationResponse {
  success: boolean;
  skin_tone: string;
  skin_tone_probabilities: Record<string, number>;
  skin_lab: {
    L: number;
    a: number;
    b: number;
  };
  recommendations: RecommendedShade[];
  error?: string;
  error_type?: string;
}

export interface RecommendationPayload {
  imageBase64?: string;
  image?: string;
  skinTone?: string;
  skin_tone?: string;
  skinLab?: {
    L: number;
    a: number;
    b: number;
  };
  skin_lab?: {
    L: number;
    a: number;
    b: number;
  };
}

export async function fetchRecommendations(
  payload: RecommendationPayload | string
): Promise<RecommendationResponse> {
  const body =
    typeof payload === 'string'
      ? { imageBase64: payload }
      : {
          imageBase64: payload.imageBase64 || payload.image,
          skinTone: payload.skinTone || payload.skin_tone,
          skinLab: payload.skinLab || payload.skin_lab,
        };

  const res = await fetch(`${API_BASE_URL}/tryon/recommend`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch AI shade recommendations');
  }

  return data;
}

// 10. Admin Endpoints
export interface AdminUser {
  id: number;
  email: string;
  role: string;
  encrypted_phone: string | null;
  encrypted_address: string | null;
  decrypted_phone?: string | null;
  decrypted_address?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at: string;
}

export interface AdminOrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  product_name?: string;
  product_sku?: string;
  hex_code?: string;
}

export interface AdminRecentOrder {
  id: number;
  user_id: number;
  user_email?: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: AdminOrderItem[];
}

export interface AdminInventoryProduct {
  id: number;
  sku: string;
  name: string;
  shade_name: string;
  hex_code: string;
  price: number;
  stock_quantity: number;
  finish?: string;
  image_url?: string;
}

export interface AdminMetrics {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  low_stock_products: number;
  low_stock_threshold?: number;
  low_stock_list?: AdminInventoryProduct[];
  totalUsers?: number;
  totalOrders?: number;
  totalRevenue?: number;
  lowStockProducts?: number;
  recent_orders?: AdminRecentOrder[];
  recentOrders?: AdminRecentOrder[];
  inventory?: AdminInventoryProduct[];
}

/**
 * Fetch all registered users with raw encrypted values and decrypted plaintext.
 * Protected by admin JWT token verification.
 */
export async function fetchAdminUsers(token?: string): Promise<AdminUser[]> {
  const authToken = token || getToken();
  if (!authToken) {
    throw new Error('No authentication token provided');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  };

  let res = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    // Try alternate base if needed
    const altBase = API_BASE_URL.endsWith('/api')
      ? API_BASE_URL.slice(0, -4)
      : `${API_BASE_URL}/api`;

    const altRes = await fetch(`${altBase}/admin/users`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (altRes.ok) {
      res = altRes;
    } else {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.error || `HTTP ${res.status}: Access denied or failed to fetch users`);
      (error as any).status = res.status;
      throw error;
    }
  }

  const data = await res.json();
  return data.users || [];
}

/**
 * Fetch admin store metrics (users, orders, revenue, inventory stock).
 * Protected by admin JWT token verification.
 */
export async function fetchAdminMetrics(token?: string): Promise<AdminMetrics> {
  const authToken = token || getToken();
  if (!authToken) {
    throw new Error('No authentication token provided');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  };

  let res = await fetch(`${API_BASE_URL}/admin/metrics`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const altBase = API_BASE_URL.endsWith('/api')
      ? API_BASE_URL.slice(0, -4)
      : `${API_BASE_URL}/api`;

    const altRes = await fetch(`${altBase}/admin/metrics`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (altRes.ok) {
      res = altRes;
    } else {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.error || `HTTP ${res.status}: Access denied or failed to fetch metrics`);
      (error as any).status = res.status;
      throw error;
    }
  }

  const data = await res.json();
  return data;
}
