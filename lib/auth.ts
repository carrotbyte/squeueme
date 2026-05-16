import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");

export async function signTicketToken(ticketId: string): Promise<string> {
  return new SignJWT({ ticketId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secret);
}

export async function verifyTicketToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.ticketId as string;
  } catch {
    return null;
  }
}

export async function signStaffToken(staffId: string, storeId: string): Promise<string> {
  return new SignJWT({ staffId, storeId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyStaffToken(token: string): Promise<{ staffId: string; storeId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { staffId: payload.staffId as string, storeId: payload.storeId as string };
  } catch {
    return null;
  }
}
