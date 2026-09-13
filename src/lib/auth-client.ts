"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  // Same-origin by default so a missing NEXT_PUBLIC_APP_URL cannot point the browser at Railway.
  baseURL: process.env.NEXT_PUBLIC_APP_URL || undefined,
  plugins: [inferAdditionalFields<typeof auth>()],
});
