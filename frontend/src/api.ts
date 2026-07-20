// Base URL of the backend API.
// - Local dev (bun run dev)  -> http://localhost:5050/api
// - Production build (Vercel) -> the deployed Render backend
// You can still override either with the VITE_API_URL env var.
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://chatboat-jdoh.onrender.com/api"
    : "http://localhost:5050/api");

// Full-page redirect entry points for OAuth (must be a browser navigation).
export const GOOGLE_AUTH_URL = `${API_URL}/auth/google`;
export const GITHUB_AUTH_URL = `${API_URL}/auth/github`;

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: string;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  company?: string;
  address?: string;
  phoneNumber?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { message?: string }).message || "Request failed");
  }

  return data as T;
}

export function register(payload: RegisterPayload): Promise<AuthUser> {
  return request<AuthUser>("/auth/register", payload);
}

export function login(payload: LoginPayload): Promise<AuthUser> {
  return request<AuthUser>("/auth/login", payload);
}

// After an OAuth redirect the frontend only receives a token in the URL.
// Exchange it for the user's details via the protected /me endpoint,
// then persist the full session.
export async function loginWithToken(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Could not complete social login");
  const me = (await res.json()) as Omit<AuthUser, "token">;
  const user: AuthUser = { ...me, token };
  saveUser(user);
  return user;
}

// ---- token / session helpers (stored in localStorage) ----

const STORAGE_KEY = "chatboat_user";

export function saveUser(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ---- Chat API ----

export interface ChatSummary {
  _id: string;
  title: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export interface ChatDetail {
  _id: string;
  title: string;
  messages: ChatMessage[];
}

function authHeaders(): Record<string, string> {
  const user = getUser();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (user) headers.Authorization = `Bearer ${user.token}`;
  return headers;
}

async function chatRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/chat${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || "Request failed");
  }
  return res.json() as Promise<T>;
}

export const listChats = () => chatRequest<ChatSummary[]>("");
export const createChat = () => chatRequest<ChatDetail>("", { method: "POST" });
export const getChat = (id: string) => chatRequest<ChatDetail>(`/${id}`);
export const searchChats = (q: string) =>
  chatRequest<ChatSummary[]>(`/search?q=${encodeURIComponent(q)}`);
export const sendChatMessage = (id: string, content: string) =>
  chatRequest<ChatDetail>(`/${id}/messages`, { method: "POST", body: JSON.stringify({ content }) });
export const renameChat = (id: string, title: string) =>
  chatRequest<ChatDetail>(`/${id}`, { method: "PATCH", body: JSON.stringify({ title }) });
export const deleteChat = (id: string) =>
  chatRequest<{ success: boolean }>(`/${id}`, { method: "DELETE" });
