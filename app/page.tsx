import Link from "next/link";
import { mockDb, type StoreQueue } from "@/lib/mock-store";
import { MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { ProductGrid } from "@/app/components/ProductGrid";
import { NewsDrawer } from "@/app/components/NewsDrawer";
import { readFileSync } from "fs";
import { join } from "path";

function loadNews() {
  try {
    const raw = readFileSync(join(process.cwd(), "public/swatch-news.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function HomePage() {
  const catalog = mockDb.getCatalog();
  const queues  = mockDb.getQueues().filter((q) => ["OPEN", "UPCOMING"].includes(q.status));
  const stores  = mockDb.getStores();
  const news    = loadNews();

  return (
    <main className="min-h-screen bg-white">
      {/* Disclaimer Banner */}
      <div className="bg-swatch-yellow text-swatch-black px-4 py-4 text-center border-b-4 border-swatch-black">
        <p className="font-black uppercase text-lg md:text-2xl tracking-tight leading-none">⚠ This is an unofficial queue system</p>
        <p className="font-bold text-sm mt-1 uppercase tracking-widest">It is not operational · For demonstration only</p>
      </div>

      {/* Header */}
      <header className="bg-swatch-black text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Red/white watch icon */}
          <svg viewBox="0 0 512 512" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
            <rect width="512" height="512" fill="#FF0000" rx="80"/>
            <rect x="196" y="20"  width="120" height="96"  rx="16" fill="white"/>
            <rect x="96"  y="108" width="320" height="296" rx="48" fill="white"/>
            <rect x="120" y="132" width="272" height="248" rx="36" fill="#FF0000"/>
            <rect x="244" y="148" width="24"  height="32"  rx="6"  fill="white"/>
            <rect x="244" y="332" width="24"  height="32"  rx="6"  fill="white"/>
            <rect x="140" y="244" width="32"  height="24"  rx="6"  fill="white"/>
            <rect x="340" y="244" width="32"  height="24"  rx="6"  fill="white"/>
            <rect x="248" y="192" width="16"  height="76"  rx="8"  fill="white" transform="rotate(-30 256 268)" transform-origin="256 268"/>
            <rect x="252" y="160" width="8"   height="108" rx="4"  fill="white" transform="rotate(60 256 268)"  transform-origin="256 268"/>
            <circle cx="256" cy="268" r="14" fill="white"/>
            <circle cx="256" cy="268" r="7"  fill="#FF0000"/>
            <rect x="416" y="244" width="28" height="24" rx="10" fill="white"/>
            <rect x="196" y="396" width="120" height="96" rx="16" fill="white"/>
          </svg>
          <div>
            <span className="font-black text-base uppercase tracking-widest leading-none">S-queue Me</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.25em] text-swatch-red leading-none">By Kwok Hong · because why not</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <NewsDrawer news={news} />
          <Link href="/staff" className="text-[11px] font-bold uppercase tracking-widest text-white opacity-50 hover:opacity-100 transition-opacity">
            Staff →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-swatch-red text-white px-5 py-12 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-2 opacity-75">Singapore · Limited Drop</p>
        <h1 className="text-6xl md:text-8xl font-black uppercase leading-none tracking-tighter mb-3">Royal Pop</h1>
        <p className="text-base font-black uppercase tracking-wide max-w-xs mx-auto leading-relaxed">
          Queue online.<br />
          Fight the scalpers.<br />
          <span className="opacity-75 text-sm font-medium normal-case tracking-normal">No sleeping on the floor,<br />no S$10,000 on Carousell.</span>
        </p>
        {/* Colour strip */}
        <div className="flex h-2 mt-8 max-w-sm mx-auto overflow-hidden rounded-full">
          {catalog.map((item) => (
            <div key={item.ref} className="flex-1" style={{ backgroundColor: item.colorHex }} />
          ))}
        </div>
      </section>

      {/* Join Queue CTAs */}
      <section className="px-4 pt-8 pb-2 max-w-2xl mx-auto space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-swatch-gray-mid mb-4">Join the Queue</h2>
        {queues.length === 0 ? (
          <p className="text-swatch-gray-mid font-bold text-sm">No queues open today.</p>
        ) : (
          queues.map((q: StoreQueue) => (
            <div key={q.id} className="border-2 border-swatch-black p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-swatch-red shrink-0" />
                    <span className="font-black uppercase tracking-wide text-sm">{q.store.name}</span>
                  </div>
                  <p className="text-xs text-swatch-gray-mid ml-5">{q.store.address}</p>
                  <p className="text-xs text-swatch-gray-mid ml-5 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(q.startsAt), "h:mm a")}–{format(new Date(q.endsAt), "h:mm a")} · {q._count.tickets} in queue
                  </p>
                </div>
                {q.status === "OPEN" ? (
                  <Link href={`/events/${q.id}`} className="btn-primary self-center whitespace-nowrap text-sm px-6 py-3">
                    Join Queue →
                  </Link>
                ) : (
                  <span className="bg-swatch-yellow text-swatch-black font-black uppercase tracking-widest text-xs px-4 py-2 self-center">
                    Opens Soon
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Catalog */}
      <section className="px-4 pt-6 pb-12 max-w-2xl mx-auto">
        <h2 className="text-xs font-black uppercase tracking-widest text-swatch-gray-mid mb-4">Availability Today</h2>
        <ProductGrid catalog={catalog} stores={stores} />
        <p className="text-[11px] text-swatch-gray-mid text-center mt-6 font-bold uppercase tracking-widest">
          Tap any watch to view photos · SGD 535–570 · Limit 1 per person
        </p>
      </section>

      {/* Pitch Section */}
      <section className="bg-swatch-black text-white px-5 py-10 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-swatch-red mb-3">Attention, Swatch HQ 👀</p>
        <h2 className="text-2xl md:text-3xl font-black uppercase leading-tight tracking-tight mb-3">
          Don&apos;t let your customers<br />go home empty-handed.
        </h2>
        <p className="text-sm opacity-75 max-w-sm mx-auto mb-6 leading-relaxed">
          If you want to operationalise this — virtual queues, fair access, zero overnight camping — I have the solution for you. ;)
        </p>
        <p className="text-sm font-black uppercase tracking-widest text-swatch-red">
          Email me at c.kwokhong@gmail.com
        </p>
      </section>

      <footer className="border-t-4 border-swatch-black px-5 py-6 text-center">
        <p className="text-[11px] uppercase tracking-widest font-bold text-swatch-gray-mid">
          © {new Date().getFullYear()} S-queue Me · Not affiliated with Swatch
        </p>
      </footer>
    </main>
  );
}
