import { useCallback, useEffect, useState } from "react";
import { api, endpoints, MoodAnimation, MoodEntry } from "@/constants/api";

export function useMoods() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMoods = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get<MoodEntry[]>(endpoints.moods);
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setMoods(sorted);
    } catch (e) {
      setError("Couldn't load your moods. Pull to refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  const addMood = useCallback(
    async (payload: { mood: string; description: string; animations: MoodAnimation }) => {
      const { data } = await api.post<MoodEntry>(endpoints.moods, payload);
      setMoods((prev) => [data, ...prev]);
      return data;
    },
    []
  );

  const removeMood = useCallback(async (id: number) => {
    setMoods((prev) => prev.filter((m) => m.id !== id));
    try {
      await api.delete(endpoints.mood(id));
    } catch {
      fetchMoods(); // roll back optimistic delete on failure
    }
  }, [fetchMoods]);

  return { moods, isLoading, error, refetch: fetchMoods, addMood, removeMood };
}
