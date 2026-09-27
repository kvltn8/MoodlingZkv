import type { Mood, Paginated, Task, User } from "./types";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

let authToken: string | null = null;

export function setApiToken(token: string | null) {
  authToken = token;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (authToken) {
    headers.set("Authorization", `Token ${authToken}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = typeof data === "string" ? data : JSON.stringify(data);
    } catch {}
    throw new Error(message);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

function unwrap<T>(data: T[] | Paginated<T>): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "results" in data) {
    return data.results;
  }
  return [];
}

export async function login(username: string, password: string) {
  return request<{ auth_token: string }>("/auth/token/login/", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

export async function register(payload: {
  username: string;
  email: string;
  password: string;
  re_password?: string;
}) {
  return request<User>("/auth/users/", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      re_password: payload.re_password ?? payload.password
    })
  });
}

export async function logout() {
  return request<unknown>("/auth/token/logout/", { method: "POST" });
}

export async function me() {
  return request<User>("/auth/users/me/");
}

export async function getTasks() {
  const data = await request<Task[] | Paginated<Task>>("/tasks/");
  return unwrap(data);
}

export async function createTask(payload: {
  title: string;
  end_date?: string;
}) {
  return request<Task>("/tasks/", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateTask(id: number, payload: Partial<Task>) {
  return request<Task>(`/tasks/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function deleteTask(id: number) {
  return request<void>(`/tasks/${id}/`, { method: "DELETE" });
}

export async function getMoods() {
  const data = await request<Mood[] | Paginated<Mood>>("/moods/");
  return unwrap(data);
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

export async function updateMood(id: number, payload: Partial<Mood>) {
  return request<Mood>(`/moods/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function deleteMood(id: number) {
  return request<void>(`/moods/${id}/`, { method: "DELETE" });
}