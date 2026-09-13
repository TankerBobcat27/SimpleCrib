import { NextResponse } from "next/server";
import { client, ensureSchema } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    await client`select 1`;
    return NextResponse.json({ ok: true, service: "shopcal" });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "db" },
      { status: 500 },
    );
  }
}
