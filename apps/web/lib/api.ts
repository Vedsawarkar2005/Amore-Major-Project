export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'GET',
    headers: getHeaders(false),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.statusText}`);
  }

  const data = await res.json();
  return data.products || [];
}

// 2. Fetch Single Product
export async function fetchProductBySku(sku: string): Promise<ApiProduct | null> {
  const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(sku)}`, {
    method: 'GET',
    headers: getHeaders(false),
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch product ${sku}: ${res.statusText}`);
  }

  const data = await res.json();
  return data.product || null;
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

