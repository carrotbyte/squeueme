import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-store";
import { signStaffToken } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ pin: z.string().min(4).max(8), storeId: z.string() });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const staff = mockDb.getStaff(parsed.data.storeId, parsed.data.pin);
  if (!staff) return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });

  const token = await signStaffToken(staff.id, staff.storeId);
  return NextResponse.json({ token, staff: { id: staff.id, name: staff.name, role: staff.role } });
}
