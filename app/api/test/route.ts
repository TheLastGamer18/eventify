import { NextResponse } from "next/server";

export async function GET() {
  console.log("[Test API] Called");

  return NextResponse.json({
    message: "API is working",
    env: {
      databaseUrl: process.env.EVENT_DATABASE_URL ? "SET" : "NOT SET",
      authSecret: process.env.BETTER_AUTH_SECRET ? "SET" : "NOT SET",
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
    },
    timestamp: new Date().toISOString(),
  });
}
