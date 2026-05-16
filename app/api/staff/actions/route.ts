import { NextRequest, NextResponse } from "next/server";
import { verifyStaffToken } from "@/lib/auth";
import { mockDb } from "@/lib/mock-store";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["callNext", "markServing", "markCompleted", "markNoShow"]),
  ticketId: z.string().optional(),
  eventId: z.string().optional(),
  count: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const staff = await verifyStaffToken(token);
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { action, ticketId, eventId, count } = parsed.data;

  if (action === "callNext" && eventId) {
    const tickets = mockDb.callNext(eventId, count ?? 5);
    return NextResponse.json({ called: tickets.length, tickets });
  }
  if (action === "markServing" && ticketId) {
    return NextResponse.json(mockDb.updateTicketStatus(ticketId, "SERVING"));
  }
  if (action === "markCompleted" && ticketId) {
    return NextResponse.json(mockDb.updateTicketStatus(ticketId, "COMPLETED", { servedAt: new Date() }));
  }
  if (action === "markNoShow" && ticketId) {
    return NextResponse.json(mockDb.updateTicketStatus(ticketId, "NO_SHOW"));
  }
  return NextResponse.json({ error: "Invalid action/params" }, { status: 400 });
}
