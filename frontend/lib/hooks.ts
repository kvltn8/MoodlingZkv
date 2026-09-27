import { useEffect, useRef, useState } from "react";

/** Eases a number from 0 (or the last value) up to `target`. Bump `replay` to restart from 0. */
export function useCountUp(target: number, duration = 1200, replay = 0) {
  const [value, setValue] = useState(0);
  const last = useRef(0);
  const lastReplay = useRef(replay);

  useEffect(() => {
    if (lastReplay.current !== replay) {
      last.current = 0;
      lastReplay.current = replay;
    }
    const startVal = last.current;
    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = startVal + (target - startVal) * eased;
      last.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, replay]);

  return value;
}

export function safeHaptic(kind: "select" | "success" | "light" = "select") {
  // Lazy import keeps web builds happy if haptics is unavailable
  import("expo-haptics")
    .then((H) => {
      if (kind === "success") return H.notificationAsync(H.NotificationFeedbackType.Success);
      if (kind === "light") return H.impactAsync(H.ImpactFeedbackStyle.Light);
      return H.selectionAsync();
    })
    .catch(() => {});
}