import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  ApiError,
  clearApiTokens,
  login as apiLogin,
  logout as apiLogout,
  me,
  register,
  setApiTokens,
  setTokensChangedHandler,
  setUnauthorizedHandler
} from "./api";
import type { User } from "./types";

// JWT login returns two tokens, so each one gets its own key (SecureStore only stores strings)
const ACCESS_KEY = "moodling_access_token";
const REFRESH_KEY = "moodling_refresh_token";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (payload: { username: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/* ---------- token storage (SecureStore on device, localStorage on web) ---------- */

async function setItem(key: string, value: string) {
  if (typeof value !== "string" || !value) {
    throw new Error("Refusing to store an empty or non-string token.");
  }
  if (Platform.OS === "web") localStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (Platform.OS === "web") localStorage.removeItem(key);
  else await SecureStore.deleteItemAsync(key);
}

async function saveTokens(tokens: { access: string; refresh: string | null }) {
  await setItem(ACCESS_KEY, tokens.access);
  if (tokens.refresh) await setItem(REFRESH_KEY, tokens.refresh);
}

async function loadTokens() {
  return { access: await getItem(ACCESS_KEY), refresh: await getItem(REFRESH_KEY) };
}

async function removeTokens() {
  await deleteItem(ACCESS_KEY);
  await deleteItem(REFRESH_KEY);
}

/* ---------- provider ---------- */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Persist tokens that api.ts silently refreshed
    setTokensChangedHandler((tokens) => {
      saveTokens(tokens).catch(() => {});
    });
    // Session is unrecoverable (refresh token expired/invalid): drop to the login screen
    setUnauthorizedHandler(() => {
      removeTokens().catch(() => {});
      setUser(null);
    });

    (async () => {
      try {
        const { access, refresh } = await loadTokens();
        if (access || refresh) {
          setApiTokens({ access, refresh });
          setUser(await me());
        }
      } catch (e) {
        // Only forget the session if the server rejected it. A network blip shouldn't log you out.
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          await removeTokens().catch(() => {});
          clearApiTokens();
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      setTokensChangedHandler(null);
      setUnauthorizedHandler(null);
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    const result = await apiLogin(username, password); // also sets the in-memory tokens
    if (!result?.access) throw new Error("Unexpected response from the server. Please try again.");
    await saveTokens({ access: result.access, refresh: result.refresh ?? null });
    setUser(await me());
  };

  const signUp = async (payload: { username: string; email: string; password: string }) => {
    await register(payload);
    await signIn(payload.username, payload.password);
  };

  const signOut = async () => {
    apiLogout(); // JWT has no server-side logout, this just clears the in-memory tokens
    await removeTokens().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}