import { useCallback, useEffect, useState } from "react";
import { api, endpoints, TaskItem } from "@/constants/api";

export function useTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get<TaskItem[]>(endpoints.tasklists);
      setTasks(data);
    } catch (e) {
      setError("Couldn't load your tasks. Pull to refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (Task: string, note = "") => {
    const { data } = await api.post<TaskItem>(endpoints.tasklists, {
      Task,
      note,
      is_done: false,
    });
    setTasks((prev) => [data, ...prev]);
    return data;
  }, []);

  const toggleTask = useCallback(async (task: TaskItem) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, is_done: !t.is_done } : t))
    );
    try {
      await api.patch(endpoints.tasklist(task.id), { is_done: !task.is_done });
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, is_done: task.is_done } : t))
      );
    }
  }, []);

  const removeTask = useCallback(async (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.delete(endpoints.tasklist(id));
    } catch {
      fetchTasks();
    }
  }, [fetchTasks]);

  return { tasks, isLoading, error, refetch: fetchTasks, addTask, toggleTask, removeTask };
}
