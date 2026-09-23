// src/audio/surahPlayer.js
//
// A single shared recitation player used by every SurahCard, so tapping
// "Listen" on one card pauses whatever else was playing rather than
// stacking audio. Deliberately not a React Context - just a tiny
// module-level pub/sub - so any SurahCard anywhere in the tree can use it
// via useSurahAudio() without a provider.

import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { useCallback, useEffect, useState } from "react";

let player = null;
let audioModeReady = false;

// status: "idle" | "loading" | "playing" | "paused" | "error"
let state = { activeKey: null, status: "idle" };
const listeners = new Set();

function setState(next) {
  state = next;
  listeners.forEach((fn) => fn(state));
}

async function ensureAudioMode() {
  if (audioModeReady) return;
  audioModeReady = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
  } catch {
    // Non-fatal - playback still works with default audio mode.
  }
}

function teardownPlayer() {
  if (!player) return;
  try {
    player.pause();
    player.release();
  } catch {
    // Player may already be released; safe to ignore.
  }
  player = null;
}

async function play(key, url) {
  if (!url) return;
  await ensureAudioMode();
  setState({ activeKey: key, status: "loading" });
  teardownPlayer();
  try {
    player = createAudioPlayer({ uri: url });
    player.play();
    setState({ activeKey: key, status: "playing" });
  } catch {
    setState({ activeKey: key, status: "error" });
  }
}

/**
 * key: any stable identifier for the recommendation (its id works well).
 * url: the recitation's audio URL. Pass the same key you toggled with -
 * this hook works out whether that's a fresh play, a resume, or a pause.
 */
export function useSurahAudio() {
  const [local, setLocal] = useState(state);

  useEffect(() => {
    listeners.add(setLocal);
    return () => listeners.delete(setLocal);
  }, []);

  const toggle = useCallback((key, url) => {
    if (state.activeKey === key && state.status === "playing") {
      player?.pause();
      setState({ activeKey: key, status: "paused" });
      return;
    }
    if (state.activeKey === key && state.status === "paused") {
      player?.play();
      setState({ activeKey: key, status: "playing" });
      return;
    }
    play(key, url);
  }, []);

  return { activeKey: local.activeKey, status: local.status, toggle };
}