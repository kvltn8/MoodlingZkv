import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Point this at your Django backend — see .env.example.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export const ACCESS_TOKEN_KEY = "moodling_access_token";
export const REFRESH_TOKEN_KEY = "moodling_refresh_token";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Attach the JWT (from djoser's auth/jwt/create) to every request.
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `JWT ${token}`;
  }
  return config;
});

// If the access token has expired, try refreshing once with the refresh
// token before giving up (djoser's auth/jwt/refresh/).
let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refresh) return Promise.reject(error);

      if (!refreshing) {
        refreshing = axios
          .post(`${API_URL}/auth/jwt/refresh/`, { refresh })
          .then(async (res) => {
            const access = res.data.access as string;
            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
            return access;
          })
          .catch(async () => {
            await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
            return null;
          })
          .finally(() => {
            refreshing = null;
          });
      }

      const newToken = await refreshing;
      if (newToken) {
        original.headers.Authorization = `JWT ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

// ---- Types matching backend/moodflow/serializers.py -----------------------

export type MoodAnimation =
  | "happy"
  | "calm"
  | "focused"
  | "tired"
  | "sad"
  | "anxious"
  | "excited";

export interface Surah {
  id: number;
  quran_id: number;
  name_arabic: string;
  name_english: string;
  name_transliteration: string;
  verses_count: number;
  revelation_place: string | null;
}

export interface QuranRecommendation {
  id: number;
  reason: string;
  surah: Surah;
  audio_url: string | null;
  reciter: string | null;
}

export interface MoodEntry {
  id: number;
  mood: string;
  description: string;
  animations: MoodAnimation;
  quran_recommendations: QuranRecommendation[];
  user: number;
  created_at: string;
}

export interface TaskItem {
  id: number;
  Task: string;
  note: string;
  is_done: boolean;
  user: number;
  created_at: string;
}

// ---- Endpoints matching backend/moodflow/urls.py --------------------------

export const endpoints = {
  moods: "/moods/",
  mood: (id: number) => `/moods/${id}/`,
  tasklists: "/tasklists/",
  tasklist: (id: number) => `/tasklists/${id}/`,
  surahs: "/surahs/",
  moodsurahs: (mood?: string) => `/moodsurahs/${mood ? `?mood=${mood}` : ""}`,
  jwtCreate: "/auth/jwt/create/",
  jwtRefresh: "/auth/jwt/refresh/",
  users: "/auth/users/",
  me: "/auth/users/me/",
};
