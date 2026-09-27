import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, api, endpoints } from "@/constants/api";

interface MoodlingUser {
  id: number;
  username: string;
  email: string;
}

interface AuthContextValue {
  user: MoodlingUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MoodlingUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    const { data } = await api.get<MoodlingUser>(endpoints.me);
    setUser(data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        if (token) {
          await refreshProfile();
        }
      } catch {
        // stale/invalid token — fall through to logged-out state
      } finally {
        setIsLoading(false);
      }
    })();
  }, [refreshProfile]);

  const login = useCallback(
    async (username: string, password: string) => {
      setError(null);
      try {
        const { data } = await api.post(endpoints.jwtCreate, { username, password });
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.access);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refresh);
        await refreshProfile();
      } catch (e: any) {
        setError(
          e?.response?.data?.detail ?? "Couldn't sign you in — check your details."
        );
        throw e;
      }
    },
    [refreshProfile]
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      setError(null);
      try {
        await api.post(endpoints.users, { username, email, password });
        await login(username, password);
      } catch (e: any) {
        const data = e?.response?.data;
        const firstError = data && typeof data === "object" ? Object.values(data)[0] : null;
        setError(
          (Array.isArray(firstError) ? firstError[0] : firstError) ??
            "Couldn't create your account."
        );
        throw e;
      }
    },
    [login]
  );

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshProfile,
      error,
    }),
    [user, isLoading, login, register, logout, refreshProfile, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
