import type { Mood, Paginated, Task, User } from "./types";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

if (!process.env.EXPO_PUBLIC_API_URL) {
  // localhost only works on web/iOS simulator. Android emulator needs 10.0.2.2,
  // a physical device needs your machine's LAN IP.
  console.warn("EXPO_PUBLIC_API_URL is not set, falling back to http://localhost:8000");
}

// Must match SIMPLE_JWT["AUTH_HEADER_TYPES"] in settings.py (default is "Bearer")
const AUTH_SCHEME = "Bearer";
const TIMEOUT_MS = 15000;

/* ---------- Errors ---------- */

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Flattens DRF/Djoser error shapes into one readable string
function formatError(data: unknown, fallback: string): string {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.map(String).join(" ");
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
    const parts = Object.entries(obj).map(([key, value]) => {
      const text = Array.isArray(value) ? value.join(" ") : String(value);
      return key === "non_field_errors" ? text : `${key}: ${text}`;
    });
    if (parts.length) return parts.join("\n");
  }
  return fallback;
}

/* ---------- Token state ---------- */

let accessToken: string | null = null;
let refreshToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setApiTokens(tokens: { access: string | null; refresh?: string | null }) {
  accessToken = tokens.access;
  if (tokens.refresh !== undefined) refreshToken = tokens.refresh;
}

export function clearApiTokens() {
  accessToken = null;
  refreshToken = null;
}

// Called when the session can't be recovered (refresh failed or no refresh token)
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

/* ---------- Core request ---------- */

let refreshPromise: Promise<boolean> | null = null;

// Shared promise so parallel 401s trigger only one refresh call
function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return Promise.resolve(false);
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await request<{ access: string; refresh?: string }>(
          "/auth/jwt/refresh/",
          { method: "POST", body: JSON.stringify({ refresh: refreshToken }) },
          { auth: false, retry: false }
        );
        accessToken = res.access;
        if (res.refresh) refreshToken = res.refresh; // when ROTATE_REFRESH_TOKENS is on
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  { auth = true, retry = true }: { auth?: boolean; retry?: boolean } = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  // Skip the header on login/register/refresh: a stale token makes DRF reject them with 401
  if (auth && accessToken) {
    headers.set("Authorization", `${AUTH_SCHEME} ${accessToken}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers, signal: controller.signal });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new ApiError(0, null, "Request timed out. Check your connection.");
    }
    throw new ApiError(0, null, "Network error. Check your connection.");
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 401 && auth && retry) {
    if (await tryRefresh()) {
      return request<T>(endpoint, options, { auth, retry: false });
    }
    clearApiTokens();
    onUnauthorized?.();
  }

  const text = await response.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data,
      formatError(data, `Request failed (${response.status})`)
    );
  }

  return data as T;
}

/* ---------- Pagination ---------- */

// Follows DRF's `next` links so nothing is silently cut off at the page size
async function getAll<T>(endpoint: string): Promise<T[]> {
  const items: T[] = [];
  let url: string | null = endpoint;

  while (url) {
    const data: T[] | Paginated<T> = await request<T[] | Paginated<T>>(url);
    if (Array.isArray(data)) return data;
    if (!data || !Array.isArray(data.results)) {
      throw new ApiError(500, data, `Unexpected response shape from ${endpoint}`);
    }
    items.push(...data.results);
    url = (data as { next?: string | null }).next ?? null;
  }

  return items;
}

/* ---------- Auth (Djoser JWT) ---------- */

export async function login(username: string, password: string) {
  // If your user model logs in by email, send { email, password } instead
  const res = await request<{ access: string; refresh: string }>(
    "/auth/jwt/create/",
    { method: "POST", body: JSON.stringify({ username, password }) },
    { auth: false }
  );
  setApiTokens({ access: res.access, refresh: res.refresh });
  return res; // persist res.refresh (e.g. expo-secure-store) so sessions survive restarts
}

export async function register(payload: {
  username: string;
  email: string;
  password: string;
  re_password?: string;
}) {
  return request<User>(
    "/auth/users/",
    {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        re_password: payload.re_password ?? payload.password
      })
    },
    { auth: false }
  );
}

// JWT has no server-side logout, so just drop the tokens
export function logout() {
  clearApiTokens();
}

export async function me() {
  return request<User>("/auth/users/me/");
}

/* ---------- Tasks (served at /tasklists/) ---------- */

export async function getTasks() {
  return getAll<Task>("/tasklists/");
}

export async function createTask(payload: { title: string; end_date?: string }) {
  return request<Task>("/tasklists/", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateTask(id: number, payload: Partial<Omit<Task, "id">>) {
  return request<Task>(`/tasklists/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function deleteTask(id: number) {
  return request<void>(`/tasklists/${id}/`, { method: "DELETE" });
}

/* ---------- Moods ---------- */

export async function getMoods() {
  return getAll<Mood>("/moods/");
}

export async function createMood(payload: {
  name: string;
  note: string;
  animation: string;
}) {
  return request<Mood>("/moods/", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateMood(id: number, payload: Partial<Omit<Mood, "id">>) {
  return request<Mood>(`/moods/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function deleteMood(id: number) {
  return request<void>(`/moods/${id}/`, { method: "DELETE" });
}