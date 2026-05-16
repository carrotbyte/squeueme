import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-store";

const AVG_SERVICE_MINUTES = 18;
const BATCH_SIZE = 5;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ qrToken: string }> }) {
  const { qrToken } = await params;
  const ticket = mockDb.getTicketByQrToken(qrToken);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const waitBatches = Math.ceil(Math.max(0, ticket.position - 1) / BATCH_SIZE);
  const eta = new Date(Date.now() + waitBatches * AVG_SERVICE_MINUTES * 60_000);
  const stats = mockDb.getStats(ticket.eventId);

  return NextResponse.json({ ticket, eta, stats });
}
