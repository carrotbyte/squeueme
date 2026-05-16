import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-store";
import { verifyStaffToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const staff = await verifyStaffToken(token);
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const tickets = mockDb.getQueueTickets(eventId);
  const stats = mockDb.getStats(eventId);
  return NextResponse.json({ tickets, stats });
}
