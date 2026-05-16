import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSMS(to: string, body: string) {
  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    });
  } catch (err) {
    console.error("[SMS] Failed to send:", err);
    throw err;
  }
}

export function buildNotifyMessage(
  name: string,
  position: number,
  storeName: string,
  windowEnd: string,
  qrUrl: string
): string {
  return `Hi ${name}! Your Swatch queue number is #${position}. Please arrive at ${storeName} by ${windowEnd}. Show your QR: ${qrUrl}`;
}

export function buildSoldOutMessage(name: string, productName: string): string {
  return `Hi ${name}, unfortunately ${productName} has sold out today. Thank you for joining the Swatch queue — we hope to see you next time!`;
}
