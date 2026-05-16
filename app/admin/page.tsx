"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductRow {
  ref: string;
  name: string;
  colorHex: string;
  ionUnits: number;
  mbsUnits: number;
}

interface EventDraft {
  id: string;
  storeName: string;
  storeId: string;
  dropName: string;
  date: string;
  openTime: string;
  closeTime: string;
  joinOpens: string;
  status: "UPCOMING" | "OPEN" | "PAUSED" | "CLOSED";
  products: ProductRow[];
}

// ─── Seed drafts ──────────────────────────────────────────────────────────────

const DEFAULT_PRODUCTS: ProductRow[] = [
  { ref: "SSX03G100N", name: "greeneight",    colorHex: "#228B22", ionUnits: 40, mbsUnits: 40 },
  { ref: "SSX03L100N", name: "lanba",         colorHex: "#1B4FD8", ionUnits: 40, mbsUnits: 40 },
  { ref: "SSX03L101N", name: "blaue_acht",    colorHex: "#0D2B7A", ionUnits: 30, mbsUnits: 30 },
  { ref: "SSX03W101N", name: "ocho_negro",    colorHex: "#111111", ionUnits: 35, mbsUnits: 35 },
  { ref: "SSX03W100N", name: "huit_blanc",    colorHex: "#C8C4BE", ionUnits: 35, mbsUnits: 35 },
  { ref: "SSX03L103N", name: "orenji_hachi",  colorHex: "#E8650A", ionUnits: 30, mbsUnits: 30 },
  { ref: "SSX03R100N", name: "otto_rosso",    colorHex: "#C0001A", ionUnits: 40, mbsUnits: 40 },
];

const todayStr = new Date().toISOString().slice(0, 10);

function makeEvent(id: string, storeId: string, storeName: string): EventDraft {
  return {
    id,
    storeId,
    storeName,
    dropName: "Royal Pop",
    date: todayStr,
    openTime: "10:00",
    closeTime: "22:00",
    joinOpens: "09:00",
    status: "OPEN",
    products: DEFAULT_PRODUCTS.map((p) => ({ ...p })),
  };
}

const INITIAL_EVENTS: EventDraft[] = [
  makeEvent("ion-royal-pop",  "ion-orchard",       "ION Orchard"),
  makeEvent("mbs-royal-pop",  "marina-bay-sands",  "Marina Bay Sands"),
];

const STATUS_OPTIONS = ["UPCOMING", "OPEN", "PAUSED", "CLOSED"] as const;
const STATUS_COLORS: Record<string, string> = {
  OPEN:     "bg-swatch-red text-white",
  UPCOMING: "bg-swatch-yellow text-swatch-black",
  PAUSED:   "bg-swatch-gray-mid text-white",
  CLOSED:   "bg-swatch-black text-white",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductTable({
  products,
  onChange,
}: {
  products: ProductRow[];
  onChange: (products: ProductRow[]) => void;
}) {
  function update(idx: number, field: keyof ProductRow, value: string | number) {
    const next = products.map((p, i) => (i === idx ? { ...p, [field]: value } : p));
    onChange(next);
  }
  function remove(idx: number) {
    onChange(products.filter((_, i) => i !== idx));
  }
  function add() {
    onChange([...products, { ref: "", name: "", colorHex: "#000000", ionUnits: 20, mbsUnits: 20 }]);
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-2 border-swatch-gray-light">
          <thead className="bg-swatch-black text-white">
            <tr>
              {["Colour", "Name", "Ref", "ION Units", "MBS Units", ""].map((h) => (
                <th key={h} className="text-left px-3 py-2 font-black uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i} className="border-t border-swatch-gray-light hover:bg-swatch-gray transition-colors">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border border-swatch-gray-light shrink-0" style={{ backgroundColor: p.colorHex }} />
                    <input
                      type="color"
                      value={p.colorHex}
                      onChange={(e) => update(i, "colorHex", e.target.value)}
                      className="w-6 h-6 cursor-pointer border-0 p-0 bg-transparent"
                      title="Pick colour"
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => update(i, "name", e.target.value)}
                    className="border border-swatch-gray-light px-2 py-1 w-28 focus:outline-none focus:border-swatch-red font-mono"
                    placeholder="folder_name"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={p.ref}
                    onChange={(e) => update(i, "ref", e.target.value)}
                    className="border border-swatch-gray-light px-2 py-1 w-28 focus:outline-none focus:border-swatch-red font-mono uppercase"
                    placeholder="SSXXXXXXXN"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={p.ionUnits}
                    onChange={(e) => update(i, "ionUnits", Number(e.target.value))}
                    className="border border-swatch-gray-light px-2 py-1 w-16 focus:outline-none focus:border-swatch-red text-right"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={p.mbsUnits}
                    onChange={(e) => update(i, "mbsUnits", Number(e.target.value))}
                    className="border border-swatch-gray-light px-2 py-1 w-16 focus:outline-none focus:border-swatch-red text-right"
                  />
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => remove(i)} className="text-swatch-gray-mid hover:text-swatch-red transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={add} className="mt-2 flex items-center gap-1 text-xs font-black uppercase tracking-widest text-swatch-gray-mid hover:text-swatch-red transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add variant
      </button>
    </div>
  );
}

function EventCard({
  event,
  onUpdate,
  onDelete,
}: {
  event: EventDraft;
  onUpdate: (e: EventDraft) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(event);

  function save() {
    onUpdate(draft);
    setEditing(false);
    toast.success("Event saved");
  }
  function cancel() {
    setDraft(event);
    setEditing(false);
  }

  const field = (label: string, el: React.ReactNode) => (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-widest text-swatch-gray-mid mb-1">{label}</label>
      {el}
    </div>
  );

  const inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      disabled={!editing}
      className="w-full border-2 border-swatch-gray-light px-3 py-2 text-sm font-bold focus:outline-none focus:border-swatch-red disabled:bg-swatch-gray disabled:text-swatch-gray-mid"
    />
  );

  return (
    <div className="border-2 border-swatch-black bg-white">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`status-badge shrink-0 ${STATUS_COLORS[event.status]}`}>{event.status}</span>
          <div className="min-w-0">
            <p className="font-black uppercase tracking-wide text-sm truncate">{event.dropName} · {event.storeName}</p>
            <p className="text-[11px] text-swatch-gray-mid">{event.date} · {event.openTime}–{event.closeTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {editing ? (
            <>
              <button onClick={save} className="text-green-600 hover:text-green-800"><Check className="w-4 h-4" /></button>
              <button onClick={cancel} className="text-swatch-gray-mid hover:text-swatch-red"><X className="w-4 h-4" /></button>
            </>
          ) : (
            <button onClick={() => { setEditing(true); setExpanded(true); }} className="text-swatch-gray-mid hover:text-swatch-black">
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onDelete} className="text-swatch-gray-mid hover:text-swatch-red"><Trash2 className="w-4 h-4" /></button>
          <button onClick={() => setExpanded((v) => !v)} className="text-swatch-gray-mid">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t-2 border-swatch-gray-light px-5 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {field("Drop Name", inp({ value: draft.dropName, onChange: (e) => setDraft({ ...draft, dropName: e.target.value }) }))}
            {field("Date", inp({ type: "date", value: draft.date, onChange: (e) => setDraft({ ...draft, date: e.target.value }) }))}
            {field("Status",
              editing ? (
                <select
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as EventDraft["status"] })}
                  className="w-full border-2 border-swatch-gray-light px-3 py-2 text-sm font-bold focus:outline-none focus:border-swatch-red"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <div className={`px-3 py-2 text-sm font-black uppercase tracking-widest ${STATUS_COLORS[event.status]}`}>{event.status}</div>
              )
            )}
            {field("Opens (public)", inp({ type: "time", value: draft.openTime, onChange: (e) => setDraft({ ...draft, openTime: e.target.value }) }))}
            {field("Closes", inp({ type: "time", value: draft.closeTime, onChange: (e) => setDraft({ ...draft, closeTime: e.target.value }) }))}
            {field("Join queue from", inp({ type: "time", value: draft.joinOpens, onChange: (e) => setDraft({ ...draft, joinOpens: e.target.value }) }))}
          </div>

          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-swatch-gray-mid mb-3">Product Variants &amp; Stock</p>
            {editing ? (
              <ProductTable
                products={draft.products}
                onChange={(products) => setDraft({ ...draft, products })}
              />
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-swatch-black">
                    {["", "Name", "Ref", "ION", "MBS", "Total"].map((h) => (
                      <th key={h} className="text-left pb-2 pr-4 font-black uppercase tracking-widest text-swatch-gray-mid">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {event.products.map((p) => (
                    <tr key={p.ref} className="border-b border-swatch-gray-light">
                      <td className="py-2 pr-3">
                        <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: p.colorHex }} />
                      </td>
                      <td className="py-2 pr-4 font-bold">{p.name}</td>
                      <td className="py-2 pr-4 font-mono text-swatch-gray-mid">{p.ref}</td>
                      <td className="py-2 pr-4 text-right font-bold">{p.ionUnits}</td>
                      <td className="py-2 pr-4 text-right font-bold">{p.mbsUnits}</td>
                      <td className="py-2 font-black text-swatch-red">{p.ionUnits + p.mbsUnits}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="pt-2 font-black uppercase tracking-widest text-xs text-swatch-gray-mid">Total</td>
                    <td className="pt-2 text-right font-black">{event.products.reduce((s, p) => s + p.ionUnits, 0)}</td>
                    <td className="pt-2 text-right font-black">{event.products.reduce((s, p) => s + p.mbsUnits, 0)}</td>
                    <td className="pt-2 font-black text-swatch-red">{event.products.reduce((s, p) => s + p.ionUnits + p.mbsUnits, 0)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [events, setEvents] = useState<EventDraft[]>(INITIAL_EVENTS);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<EventDraft, "id" | "products">>({
    storeId: "ion-orchard",
    storeName: "ION Orchard",
    dropName: "Royal Pop",
    date: todayStr,
    openTime: "10:00",
    closeTime: "22:00",
    joinOpens: "09:00",
    status: "UPCOMING",
  });

  function addEvent() {
    if (!newEvent.dropName.trim() || !newEvent.date) { toast.error("Fill in all required fields"); return; }
    const id = `${newEvent.storeId}-${Date.now()}`;
    setEvents([...events, { ...newEvent, id, products: DEFAULT_PRODUCTS.map((p) => ({ ...p })) }]);
    setShowNewForm(false);
    toast.success("Event created");
  }

  const storeOptions = [
    { id: "ion-orchard",      name: "ION Orchard" },
    { id: "marina-bay-sands", name: "Marina Bay Sands" },
  ];

  const inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className="w-full border-2 border-swatch-black px-3 py-2 text-sm font-bold focus:outline-none focus:border-swatch-red"
    />
  );

  return (
    <main className="min-h-screen bg-swatch-gray">
      <header className="bg-swatch-black text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-swatch-red rounded-full" />
          <span className="font-black uppercase tracking-widest text-sm">Admin · Events</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/staff" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
            Staff Login
          </Link>
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
            ← Public
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {(["OPEN", "UPCOMING", "CLOSED"] as const).map((s) => (
            <div key={s} className="card p-4 text-center">
              <p className="text-2xl font-black">{events.filter((e) => e.status === s).length}</p>
              <p className={`text-[11px] font-black uppercase tracking-widest mt-1 status-badge ${STATUS_COLORS[s]}`}>{s}</p>
            </div>
          ))}
        </div>

        {/* Events list */}
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onUpdate={(updated) => setEvents(events.map((e) => (e.id === updated.id ? updated : e)))}
              onDelete={() => { setEvents(events.filter((e) => e.id !== event.id)); toast.success("Deleted"); }}
            />
          ))}
        </div>

        {/* New event form */}
        {showNewForm ? (
          <div className="border-2 border-swatch-black bg-white p-5 space-y-4">
            <h2 className="font-black uppercase tracking-widest text-sm border-b-4 border-swatch-red pb-3">New Drop Event</h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-swatch-gray-mid mb-1">Store</label>
                <select
                  value={newEvent.storeId}
                  onChange={(e) => {
                    const store = storeOptions.find((s) => s.id === e.target.value)!;
                    setNewEvent({ ...newEvent, storeId: store.id, storeName: store.name });
                  }}
                  className="w-full border-2 border-swatch-black px-3 py-2 text-sm font-bold focus:outline-none focus:border-swatch-red"
                >
                  {storeOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-swatch-gray-mid mb-1">Drop Name</label>
                {inp({ value: newEvent.dropName, placeholder: "e.g. Royal Pop", onChange: (e) => setNewEvent({ ...newEvent, dropName: e.target.value }) })}
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-swatch-gray-mid mb-1">Date</label>
                {inp({ type: "date", value: newEvent.date, onChange: (e) => setNewEvent({ ...newEvent, date: e.target.value }) })}
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-swatch-gray-mid mb-1">Opens</label>
                {inp({ type: "time", value: newEvent.openTime, onChange: (e) => setNewEvent({ ...newEvent, openTime: e.target.value }) })}
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-swatch-gray-mid mb-1">Closes</label>
                {inp({ type: "time", value: newEvent.closeTime, onChange: (e) => setNewEvent({ ...newEvent, closeTime: e.target.value }) })}
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-swatch-gray-mid mb-1">Join queue from</label>
                {inp({ type: "time", value: newEvent.joinOpens, onChange: (e) => setNewEvent({ ...newEvent, joinOpens: e.target.value }) })}
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-swatch-gray-mid mb-1">Status</label>
                <select
                  value={newEvent.status}
                  onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as EventDraft["status"] })}
                  className="w-full border-2 border-swatch-black px-3 py-2 text-sm font-bold focus:outline-none focus:border-swatch-red"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <p className="text-[11px] text-swatch-gray-mid">Product variants (units per store) can be edited after creation.</p>

            <div className="flex gap-3 pt-2">
              <button onClick={addEvent} className="btn-primary flex-1">Create Event</button>
              <button onClick={() => setShowNewForm(false)} className="btn-outline px-6">Cancel</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewForm(true)}
            className="btn-outline w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Drop Event
          </button>
        )}

        <p className="text-[11px] text-center text-swatch-gray-mid font-bold uppercase tracking-widest">
          Changes are in-memory only · Connect Supabase to persist
        </p>
      </div>
    </main>
  );
}
