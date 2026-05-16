// Seed script for when Supabase/Prisma is wired up.
// Currently using mock-store.ts for local dev — this file is not executed.
import { PrismaClient } from "@prisma/client";

type EventStatus = "UPCOMING" | "OPEN" | "PAUSED" | "CLOSED";
type StaffRole = "FLOOR" | "MANAGER";
const EventStatus = { UPCOMING: "UPCOMING" as EventStatus, OPEN: "OPEN" as EventStatus };
const StaffRole = { FLOOR: "FLOOR" as StaffRole };

const db = new PrismaClient();

async function main() {
  const store1 = await db.store.upsert({
    where: { id: "city-square-jb" },
    update: {},
    create: {
      id: "city-square-jb",
      name: "Swatch JB City Square",
      mall: "City Square Mall",
      address: "106-108 Jalan Wong Ah Fook, Johor Bahru",
      lat: 1.4636,
      lng: 103.7659,
    },
  });

  const store2 = await db.store.upsert({
    where: { id: "paradigm-jb" },
    update: {},
    create: {
      id: "paradigm-jb",
      name: "Swatch Paradigm JB",
      mall: "Paradigm Mall JB",
      address: "Paradigm Mall, Johor Bahru",
      lat: 1.4903,
      lng: 103.7196,
    },
  });

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400_000);

  await db.dropEvent.upsert({
    where: { id: "moonswatch-snoopy-jb" },
    update: {},
    create: {
      id: "moonswatch-snoopy-jb",
      storeId: store1.id,
      productName: "MoonSwatch Mission to the Moon Snoopy",
      unitsPerDay: 80,
      status: EventStatus.OPEN,
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0),
      joinOpensAt: new Date(now.getTime() - 3600_000),
      joinClosesAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0),
    },
  });

  await db.dropEvent.upsert({
    where: { id: "bioceramic-aquanaut-jb" },
    update: {},
    create: {
      id: "bioceramic-aquanaut-jb",
      storeId: store2.id,
      productName: "Swatch x Blancpain Bioceramic Scuba Fifty Fathoms",
      unitsPerDay: 50,
      status: EventStatus.UPCOMING,
      startsAt: tomorrow,
      endsAt: new Date(tomorrow.getTime() + 36000_000),
      joinOpensAt: new Date(now.getTime()),
      joinClosesAt: new Date(tomorrow.getTime() + 32400_000),
    },
  });

  await db.staffUser.upsert({
    where: { id: "staff-jb-1" },
    update: {},
    create: { id: "staff-jb-1", storeId: store1.id, name: "Aisyah", pin: "1234", role: StaffRole.FLOOR },
  });

  await db.staffUser.upsert({
    where: { id: "staff-paradigm-1" },
    update: {},
    create: { id: "staff-paradigm-1", storeId: store2.id, name: "Razif", pin: "5678", role: StaffRole.FLOOR },
  });

  console.log("✓ Seeded: 2 stores, 2 events, 2 staff users");
}

main().catch(console.error).finally(() => db.$disconnect());
