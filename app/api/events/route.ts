import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-store";

export async function GET() {
  const events = mockDb.getEvents().filter((e) => ["UPCOMING", "OPEN"].includes(e.status));
  return NextResponse.json(events);
}
