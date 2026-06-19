import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { pool } from "./db";
//turning off logs because they are not needed for now
// console.log("[Auth] Initializing auth with env:", {
//   databaseUrl: process.env.EVENT_DATABASE_URL ? "SET" : "MISSING",
//   authSecret: process.env.BETTER_AUTH_SECRET ? "SET" : "MISSING",
//   appUrl: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
// });

// Configure BetterAuth for Next.js
const trustedOrigins = [
  "http://localhost:3000",
  process.env.NEXT_PUBLIC_APP_URL || "",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
].filter(Boolean);

//console.log("[Auth] Trusted origins:", trustedOrigins);

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET || "",
  trustedOrigins,
  basePath: "/api/auth",
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    nextCookies(), // Automatically handles cookies in Next.js - must be last plugin
  ],
});

//console.log("[Auth] Auth initialized successfully");

export type Session = typeof auth.$Infer.Session;
