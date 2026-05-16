// In-memory mock store — replaces Prisma + Redis for local dev/demo.
// All state lives in module-level variables; resets on server restart.

export type EventStatus = "UPCOMING" | "OPEN" | "PAUSED" | "CLOSED";
export type TicketStatus =
  | "WAITING"
  | "NOTIFIED"
  | "CHECKED_IN"
  | "SERVING"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED";
export type StaffRole = "FLOOR" | "MANAGER";

export interface Store {
  id: string;
  name: string;
  mall: string;
  address: string;
  hours: string;
  lat: number;
  lng: number;
}

// Product in the Royal Pop catalog — shown for display/stock only.
export interface CatalogItem {
  ref: string;
  name: string;      // folder name, used as display name (underscores → spaces, capitalized)
  img: string;       // front image path under /public
  images: string[];  // all product images for the modal
  price: string;
  colorHex: string;
  stock: Record<string, { total: number; sold: number }>;
}

// A store-level queue event — one per store per drop day.
// Users join the store queue; they choose their watch at the counter.
export interface StoreQueue {
  id: string;
  storeId: string;
  store: Store;
  dropName: string;      // e.g. "Royal Pop"
  status: EventStatus;
  startsAt: Date;
  endsAt: Date;
  joinOpensAt: Date;
  joinClosesAt: Date;
  _count: { tickets: number };
}

export interface Ticket {
  id: string;
  eventId: string;
  event: StoreQueue;
  phoneHash: string;
  displayName: string;
  position: number;
  status: TicketStatus;
  qrToken: string;
  notifiedAt?: Date;
  checkInAt?: Date;
  servedAt?: Date;
  createdAt: Date;
}

export interface StaffUser {
  id: string;
  storeId: string;
  name: string;
  pin: string;
  role: StaffRole;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const now = new Date();
const today10am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0);
const today10pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0);
const yesterday = new Date(now.getTime() - 3_600_000);

const stores: Store[] = [
  {
    id: "ion-orchard",
    name: "Swatch ION Orchard",
    mall: "ION Orchard",
    address: "#B2-25/26, 2 Orchard Turn, Singapore 238801",
    hours: "Mon–Sun 10:00–22:00",
    lat: 1.3040,
    lng: 103.8318,
  },
  {
    id: "marina-bay-sands",
    name: "Swatch Marina Bay Sands",
    mall: "The Shoppes at Marina Bay Sands",
    address: "#B2M-204, 2 Bayfront Ave, Singapore 018972",
    hours: "Mon–Thu 10:30–22:00 · Fri–Sat 10:30–23:00 · Sun 10:30–22:00",
    lat: 1.2834,
    lng: 103.8607,
  },
];

// Royal Pop "Eight" collection
// All SGD 535 except lanba and otg_roz which are SGD 570
export const catalog: CatalogItem[] = [
  {
    ref: "SSX03G100N",
    name: "greeneight",
    img: "/royalpop/greeneight/front_SSX03G100N_sa000_er003m.avif",
    images: [
      "/royalpop/greeneight/front_SSX03G100N_sa000_er003m.avif",
      "/royalpop/greeneight/SSX03G100N_li1_ec001.jpg",
      "/royalpop/greeneight/SSX03G100N_li2_ec001.jpg",
      "/royalpop/greeneight/SSX03G100N_li3_ec001.jpg",
      "/royalpop/greeneight/SSX03G100N_li4_ec001.jpg",
      "/royalpop/greeneight/SSX03G100N_li5_ec001-1080x1080.jpg",
      "/royalpop/greeneight/SSX03G100N_li6_ec001.jpg",
      "/royalpop/greeneight/back_SSX03G100N_sa300_er003m.avif",
    ],
    price: "SGD 535",
    colorHex: "#228B22",
    stock: {
      "ion-orchard":      { total: 40, sold: 12 },
      "marina-bay-sands": { total: 40, sold: 35 },
    },
  },
  {
    ref: "SSX03L100N",
    name: "lanba",
    img: "/royalpop/lanba/front_lanba_SSX03L100N_sa000_er003m.avif",
    images: [
      "/royalpop/lanba/front_lanba_SSX03L100N_sa000_er003m.avif",
      "/royalpop/lanba/lanba_SSX03L100N_li1_ec001.jpg",
      "/royalpop/lanba/lanba_SSX03L100N_li2_ec001.jpg",
      "/royalpop/lanba/lanba_SSX03L100N_li3_ec001.avif",
      "/royalpop/lanba/lanba_SSX03L100N_li4_ec001.jpg",
      "/royalpop/lanba/back_lanba_SSX03L100N_sa300_er003m.avif",
    ],
    price: "SGD 570",
    colorHex: "#1B4FD8",
    stock: {
      "ion-orchard":      { total: 40, sold: 28 },
      "marina-bay-sands": { total: 40, sold: 10 },
    },
  },
  {
    ref: "SSX03L101N",
    name: "blaue_acht",
    img: "/royalpop/blaue_acht/front_SSX03L101N_sa000_er003m.avif",
    images: [
      "/royalpop/blaue_acht/front_SSX03L101N_sa000_er003m.avif",
      "/royalpop/blaue_acht/SSX03L101N_li2_ec001-1080x1080.webp",
      "/royalpop/blaue_acht/SSX03L101N_li3_ec001.avif",
      "/royalpop/blaue_acht/SSX03L101N_li4_ec001.jpg",
      "/royalpop/blaue_acht/back_SSX03L101N_sa300_er003m.avif",
    ],
    price: "SGD 535",
    colorHex: "#0D2B7A",
    stock: {
      "ion-orchard":      { total: 30, sold: 5 },
      "marina-bay-sands": { total: 30, sold: 18 },
    },
  },
  {
    ref: "SSX03W101N",
    name: "ocho_negro",
    img: "/royalpop/ocho_negro/SSX03W101N_sa000_er003m.avif",
    images: [
      "/royalpop/ocho_negro/SSX03W101N_sa000_er003m.avif",
      "/royalpop/ocho_negro/SSX03W101N_li1_ec001.avif",
      "/royalpop/ocho_negro/SSX03W101N_li2_ec001.avif",
      "/royalpop/ocho_negro/SSX03W101N_li3_ec001.avif",
      "/royalpop/ocho_negro/SSX03W101N_li4_ec001.avif",
      "/royalpop/ocho_negro/SSX03W101N_sa300_er003m.avif",
    ],
    price: "SGD 535",
    colorHex: "#111111",
    stock: {
      "ion-orchard":      { total: 35, sold: 35 },
      "marina-bay-sands": { total: 35, sold: 20 },
    },
  },
  {
    ref: "SSX03W100N",
    name: "huit_blanc",
    img: "/royalpop/huit_blanc/front_SSX03W100N_sa000_er003m.avif",
    images: [
      "/royalpop/huit_blanc/front_SSX03W100N_sa000_er003m.avif",
      "/royalpop/huit_blanc/SSX03W100N_li1_ec001.jpg",
      "/royalpop/huit_blanc/SSX03W100N_li2_ec001.avif",
      "/royalpop/huit_blanc/SSX03W100N_li3_ec001.jpg",
      "/royalpop/huit_blanc/SSX03W100N_li4_ec001.jpg",
      "/royalpop/huit_blanc/SSX03W100N_li5_ec001.avif",
      "/royalpop/huit_blanc/back_SSX03W100N_sa300_er003m.avif",
    ],
    price: "SGD 535",
    colorHex: "#C8C4BE",
    stock: {
      "ion-orchard":      { total: 35, sold: 8 },
      "marina-bay-sands": { total: 35, sold: 30 },
    },
  },
  {
    ref: "SSX03L103N",
    name: "orenji_hachi",
    img: "/royalpop/orenji_hachi/front_SSX03L103N_sa000_er003m.avif",
    images: [
      "/royalpop/orenji_hachi/front_SSX03L103N_sa000_er003m.avif",
      "/royalpop/orenji_hachi/SSX03L103N_li1_ec001.jpg",
      "/royalpop/orenji_hachi/SSX03L103N_li2_ec001.jpg",
      "/royalpop/orenji_hachi/SSX03L103N_li3_ec001.jpg",
      "/royalpop/orenji_hachi/SSX03L103N_li4_ec001.avif",
      "/royalpop/orenji_hachi/back_SSX03L103N_sa300_er003m.avif",
    ],
    price: "SGD 535",
    colorHex: "#E8650A",
    stock: {
      "ion-orchard":      { total: 30, sold: 2 },
      "marina-bay-sands": { total: 30, sold: 28 },
    },
  },
  {
    ref: "SSX03J100N",
    name: "otg_roz",
    img: "/royalpop/otg_roz/front_SSX03J100N_sa000_er003m.avif",
    images: [
      "/royalpop/otg_roz/front_SSX03J100N_sa000_er003m.avif",
      "/royalpop/otg_roz/SSX03J100N_li1_ec001.jpg",
      "/royalpop/otg_roz/SSX03J100N_li2_ec001.jpg",
      "/royalpop/otg_roz/SSX03J100N_li3_ec001.jpg",
      "/royalpop/otg_roz/SSX03J100N_li4_ec001.jpg",
      "/royalpop/otg_roz/back_SSX03J100N_sa300_er003m.avif",
    ],
    price: "SGD 570",
    colorHex: "#D4547A",
    stock: {
      "ion-orchard":      { total: 30, sold: 4 },
      "marina-bay-sands": { total: 30, sold: 22 },
    },
  },
  {
    ref: "SSX03R100N",
    name: "otto_rosso",
    img: "/royalpop/otto_rosso/front_SSX03R100N_sa000_er003m.avif",
    images: [
      "/royalpop/otto_rosso/front_SSX03R100N_sa000_er003m.avif",
      "/royalpop/otto_rosso/SSX03R100N_li1_ec001.jpg",
      "/royalpop/otto_rosso/SSX03R100N_li2_ec001.jpg",
      "/royalpop/otto_rosso/SSX03R100N_li3_ec001.jpg",
      "/royalpop/otto_rosso/SSX03R100N_li4_ec001.webp",
      "/royalpop/otto_rosso/back_SSX03R100N_sa300_er003m.png",
    ],
    price: "SGD 535",
    colorHex: "#C0001A",
    stock: {
      "ion-orchard":      { total: 40, sold: 22 },
      "marina-bay-sands": { total: 40, sold: 40 },
    },
  },
];

// One store-level queue per store for the Royal Pop drop
const queues: StoreQueue[] = [
  {
    id: "ion-royal-pop",
    storeId: "ion-orchard",
    store: stores[0],
    dropName: "Royal Pop",
    status: "OPEN",
    startsAt: today10am,
    endsAt: today10pm,
    joinOpensAt: yesterday,
    joinClosesAt: today10pm,
    _count: { tickets: 0 },
  },
  {
    id: "mbs-royal-pop",
    storeId: "marina-bay-sands",
    store: stores[1],
    dropName: "Royal Pop",
    status: "OPEN",
    startsAt: today10am,
    endsAt: today10pm,
    joinOpensAt: yesterday,
    joinClosesAt: today10pm,
    _count: { tickets: 0 },
  },
];

const tickets: Ticket[] = [];

// Pre-seed demo tickets on the ION queue
const demoNames = ["Mei Lin", "Raj Kumar", "Sarah Tan", "Amir Hassan", "Priya Nair"];
demoNames.forEach((name, i) => {
  tickets.push({
    id: `demo-ticket-${i + 1}`,
    eventId: "ion-royal-pop",
    event: queues[0],
    phoneHash: `demo-hash-${i}`,
    displayName: name,
    position: i + 1,
    status: i === 0 ? "SERVING" : i === 1 ? "NOTIFIED" : "WAITING",
    qrToken: `demo-qr-${i + 1}`,
    createdAt: new Date(now.getTime() - (5 - i) * 300_000),
    notifiedAt: i <= 1 ? new Date(now.getTime() - 600_000) : undefined,
  });
});
queues[0]._count.tickets = tickets.length;

const staffUsers: StaffUser[] = [
  { id: "staff-ion-1",  storeId: "ion-orchard",       name: "Jasmine",  pin: "1234", role: "FLOOR" },
  { id: "staff-mbs-1",  storeId: "marina-bay-sands",  name: "Wei Kang", pin: "5678", role: "FLOOR" },
];

// ─── Position counters ────────────────────────────────────────────────────────

const positionCounters: Record<string, number> = {
  "ion-royal-pop":  demoNames.length,
  "mbs-royal-pop":  0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function stockLeft(item: CatalogItem, storeId: string): number {
  const s = item.stock[storeId];
  return s ? Math.max(0, s.total - s.sold) : 0;
}

export const mockDb = {
  getStores: () => stores,
  getCatalog: () => catalog,
  getQueues: () => queues,

  // "events" alias so existing API routes work unchanged
  getEvents: () => queues as unknown as StoreQueue[],
  getEvent: (id: string) => queues.find((q) => q.id === id),

  getTicketByQrToken: (qrToken: string) => tickets.find((t) => t.qrToken === qrToken),
  getTicketByPhone: (eventId: string, phoneHash: string) =>
    tickets.find((t) => t.eventId === eventId && t.phoneHash === phoneHash),

  getQueueTickets: (eventId: string) =>
    tickets
      .filter((t) => ["WAITING", "NOTIFIED", "CHECKED_IN", "SERVING"].includes(t.status) && t.eventId === eventId)
      .sort((a, b) => a.position - b.position),

  getStaff: (storeId: string, pin: string) =>
    staffUsers.find((s) => s.storeId === storeId && s.pin === pin),

  createTicket: (data: Omit<Ticket, "id" | "createdAt" | "event">): Ticket => {
    const event = queues.find((q) => q.id === data.eventId)!;
    const ticket: Ticket = { ...data, id: crypto.randomUUID(), createdAt: new Date(), event };
    tickets.push(ticket);
    event._count.tickets += 1;
    return ticket;
  },

  updateTicketStatus: (id: string, status: TicketStatus, extra?: Partial<Ticket>): Ticket | null => {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return null;
    Object.assign(ticket, { status, ...extra });
    return ticket;
  },

  nextPosition: (eventId: string): number => {
    positionCounters[eventId] = (positionCounters[eventId] ?? 0) + 1;
    return positionCounters[eventId];
  },

  getStats: (eventId: string) => {
    const eventTickets = tickets.filter((t) => t.eventId === eventId);
    const waiting   = eventTickets.filter((t) => t.status === "WAITING").length;
    const serving   = eventTickets.filter((t) => t.status === "SERVING").length;
    const completed = eventTickets.filter((t) => ["COMPLETED", "NO_SHOW"].includes(t.status)).length;
    return { waiting, serving, completed };
  },

  callNext: (eventId: string, count: number): Ticket[] => {
    const waiting = tickets
      .filter((t) => t.eventId === eventId && t.status === "WAITING")
      .sort((a, b) => a.position - b.position)
      .slice(0, count);
    waiting.forEach((t) => { t.status = "NOTIFIED"; t.notifiedAt = new Date(); });
    return waiting;
  },
};
