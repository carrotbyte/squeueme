import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mockDb } from "@/lib/mock-store";
import { hashPhone } from "@/lib/hash";

const AVG_SERVICE_MINUTES = 18;
const BATCH_SIZE = 5;

const joinSchema = z.object({
  name: z.string().min(2).max(60),
  phone: z.string().min(8).max(20),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const body = await req.json();
  const parsed = joinSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { name, phone } = parsed.data;
  const phoneHash = hashPhone(phone);

  const event = mockDb.getEvent(eventId);
  if (!event || event.status !== "OPEN") {
    return NextResponse.json({ error: "Queue is not open" }, { status: 400 });
  }

  const existing = mockDb.getTicketByPhone(eventId, phoneHash);
  if (existing) {
    return NextResponse.json({ error: "Already in queue", ticketId: existing.id }, { status: 409 });
  }

  const position = mockDb.nextPosition(eventId);
  const waitBatches = Math.ceil(Math.max(0, position - 1) / BATCH_SIZE);
  const eta = new Date(Date.now() + waitBatches * AVG_SERVICE_MINUTES * 60_000);

  const ticket = mockDb.createTicket({
    eventId,
    phoneHash,
    displayName: name,
    position,
    status: "WAITING",
    qrToken: crypto.randomUUID(),
  });

  return NextResponse.json({ ticket, eta });
}
