import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { account, session, user, verification } from "@/lib/db/schema";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "shopcal-dev-secret-change-me-32ch",
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:43147",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      tenantId: { type: "string", required: true, input: true },
      tenantSlug: { type: "string", required: true, input: true },
      role: { type: "string", required: true, defaultValue: "operator", input: true },
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    "http://127.0.0.1:43147",
    "http://localhost:43147",
  ].filter(Boolean) as string[],
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
