import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-store";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ qrToken: string }> }) {
  const { qrToken } = await params;
  const ticket = mockDb.getTicketByQrToken(qrToken);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ticket.status !== "NOTIFIED") {
    return NextResponse.json({ error: "Not yet notified" }, { status: 400 });
  }
  const updated = mockDb.updateTicketStatus(ticket.id, "CHECKED_IN", { checkInAt: new Date() });
  return NextResponse.json(updated);
}
