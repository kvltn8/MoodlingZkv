import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { login as apiLogin, logout as apiLogout, me, register, setApiToken } from "./api";
import type { User } from "./types";

const TOKEN_KEY = "moodling_auth_token";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (payload: { username: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function saveToken(token: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function loadToken() {
  if (Platform.OS === "web") return localStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function removeToken() {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await loadToken();
        if (stored) {
          setApiToken(stored);
          const currentUser = await me();
          setToken(stored);
          setUser(currentUser);
        }
      } catch {
        await removeToken();
        setApiToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (username: string, password: string) => {
    const result = await apiLogin(username, password);
    await saveToken(result.auth_token);
    setApiToken(result.auth_token);
    const currentUser = await me();
    setToken(result.auth_token);
    setUser(currentUser);
  };

  const signUp = async (payload: { username: string; email: string; password: string }) => {
    await register(payload);
    await signIn(payload.username, payload.password);
  };

  const signOut = async () => {
    try {
      if (token) await apiLogout();
    } catch {}
    await removeToken();
    setApiToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
