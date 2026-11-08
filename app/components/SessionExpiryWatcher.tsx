"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

const EXPIRY_MARGIN_MS = 5_000;

export default function SessionExpiryWatcher() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    const expiresAt = session?.accessTokenExpires;
    if (!expiresAt) return;

    const msUntilExpiry = expiresAt - Date.now() - EXPIRY_MARGIN_MS;

    if (msUntilExpiry <= 0) {
      signOut({ redirect: false }).finally(() => {
        window.location.href = "/login";
      });
      return;
    }

    const timer = window.setTimeout(() => {
      signOut({ redirect: false }).finally(() => {
        window.location.href = "/login";
      });
    }, msUntilExpiry);

    return () => window.clearTimeout(timer);
  }, [session?.accessTokenExpires, status]);

  return null;
}
