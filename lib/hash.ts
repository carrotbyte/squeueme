import { createHash } from "crypto";

export function hashPhone(phone: string): string {
  return createHash("sha256")
    .update(phone.trim().replace(/\s+/g, ""))
    .digest("hex");
}
