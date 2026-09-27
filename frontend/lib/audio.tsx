import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

type AudioContextValue = {
  /** key of the item currently loaded (e.g. "mood-12") */
  activeKey: string | null;
  playing: boolean;
  loading: boolean;
  /** 0 → 1 */
  progress: number;
  toggle: (key: string, url: string) => void;
  stop: () => void;
};

const AudioCtx = createContext<AudioContextValue | null>(null);

export function normalizeAudioUrl(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http://")) return url.replace("http://", "https://");
  return url;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  useEffect(() => {
    if (status.didJustFinish) setActiveKey(null);
  }, [status.didJustFinish]);

  const toggle = useCallback(
    (key: string, url: string) => {
      if (activeKey === key) {
        if (status.playing) player.pause();
        else player.play();
        return;
      }
      setActiveKey(key);
      player.replace(normalizeAudioUrl(url));
      player.play();
    },
    [activeKey, player, status.playing]
  );

  const stop = useCallback(() => {
    player.pause();
    setActiveKey(null);
  }, [player]);

  const value = useMemo<AudioContextValue>(
    () => ({
      activeKey,
      playing: Boolean(activeKey) && status.playing,
      loading: Boolean(activeKey) && (status.isBuffering || !status.isLoaded) && !status.playing,
      progress: status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0,
      toggle,
      stop
    }),
    [activeKey, status.playing, status.isBuffering, status.isLoaded, status.duration, status.currentTime, toggle, stop]
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudio() {
  const value = useContext(AudioCtx);
  if (!value) throw new Error("useAudio must be used inside AudioProvider");
  return value;
}