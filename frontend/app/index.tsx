import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { HelloAnimation } from "../components/HelloAnimation";
import { useAuth } from "../lib/auth";

export default function Index() {
  const { user, loading } = useAuth();
  const [introDone, setIntroDone] = useState(false);

  if (loading || !introDone) {
    return <HelloAnimation onFinish={() => setIntroDone(true)} />;
  }

  return user ? <Redirect href="/(app)/home" /> : <Redirect href="/(auth)/login" />;
}
