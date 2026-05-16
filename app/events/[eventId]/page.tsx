"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Clock, ArrowLeft, LocateFixed, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import toast from "react-hot-toast";
import { checkSingaporeLocation, type GeoResult } from "@/lib/singapore";

interface QueueData {
  id: string;
  dropName: string;
  status: string;
  startsAt: string;
  endsAt: string;
  store: { name: string; mall: string; address: string; hours: string };
  _count: { tickets: number };
}

type GeoState = "idle" | "checking" | "approved" | "denied" | "outside" | "unavailable";

export default function JoinQueuePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();

  const [queue, setQueue] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [geoState, setGeoState] = useState<GeoState>("idle");

  const fetchQueue = useCallback(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((qs: QueueData[]) => {
        setQueue(qs.find((q) => q.id === eventId) ?? null);
        setLoading(false);
      });
  }, [eventId]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  async function handleLocationCheck() {
    setGeoState("checking");
    const result: GeoResult = await checkSingaporeLocation();
    if (result.ok) {
      setGeoState("approved");
    } else {
      setGeoState(
        result.reason === "permission_denied" ? "denied"
        : result.reason === "outside_singapore" ? "outside"
        : "unavailable"
      );
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (geoState !== "approved") { toast.error("Please verify your Singapore location first."); return; }
    if (!form.name.trim() || !form.phone.trim()) { toast.error("Please fill in all fields"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(res.status === 409 ? "You're already in the queue!" : (data.error ?? "Something went wrong"));
        return;
      }
      toast.success("You're in the queue!");
      router.push(`/ticket/${data.ticket.qrToken}`);
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-swatch-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="font-black text-2xl">Queue not found.</p>
        <Link href="/" className="btn-primary">← Back</Link>
      </div>
    );
  }

  const isOpen = queue.status === "OPEN";

  return (
    <main className="min-h-screen bg-white">
      <header className="bg-swatch-black text-white px-5 py-4 flex items-center gap-4">
        <Link href="/" className="text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <span className="font-black uppercase tracking-widest">Swatch Queue</span>
      </header>

      {/* Store hero */}
      <div className="bg-swatch-black text-white px-5 py-8">
        <p className="text-xs font-black uppercase tracking-[0.3em] mb-1 text-swatch-red">{queue.dropName}</p>
        <h1 className="text-3xl font-black uppercase leading-none mb-3">{queue.store.name}</h1>
        <div className="space-y-1 text-sm opacity-75">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{queue.store.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              {format(new Date(queue.startsAt), "EEE d MMM")} · {format(new Date(queue.startsAt), "h:mm a")}–{format(new Date(queue.endsAt), "h:mm a")}
            </span>
          </div>
        </div>
        <div className="mt-4 bg-white/10 px-4 py-2 inline-block">
          <span className="font-black uppercase tracking-widest text-sm">{queue._count.tickets} people in queue</span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-8 space-y-5">

        {/* Info box */}
        <div className="bg-swatch-gray px-4 py-3 border-l-4 border-swatch-red">
          <p className="font-black uppercase tracking-wide text-sm">Choose your watch at the counter</p>
          <p className="text-xs text-swatch-gray-mid mt-1">
            Join the queue now — you&apos;ll pick your Royal Pop colour when you&apos;re called up. Check availability on the main page.
          </p>
        </div>

        {!isOpen && (
          <div className="bg-swatch-gray border-2 border-swatch-black p-4 text-center">
            <p className="font-black uppercase tracking-widest text-sm">
              {queue.status === "UPCOMING" ? "Queue opens soon" : queue.status === "PAUSED" ? "Queue paused" : "Queue closed"}
            </p>
          </div>
        )}

        {isOpen && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase border-b-4 border-swatch-red pb-3">Join Queue</h2>

            {/* Singapore geofence gate */}
            {geoState === "idle" && (
              <div className="border-2 border-swatch-black p-5 text-center space-y-3">
                <LocateFixed className="w-8 h-8 mx-auto text-swatch-red" />
                <p className="font-black uppercase tracking-widest text-sm">Singapore Residents Only</p>
                <p className="text-xs text-swatch-gray-mid">We need to confirm you&apos;re in Singapore before joining.</p>
                <button onClick={handleLocationCheck} className="btn-primary w-full">
                  Verify My Location
                </button>
              </div>
            )}

            {geoState === "checking" && (
              <div className="border-2 border-swatch-black p-5 text-center">
                <div className="w-8 h-8 border-4 border-swatch-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="font-black uppercase tracking-widest text-sm">Checking location…</p>
              </div>
            )}

            {geoState === "outside" && (
              <div className="bg-swatch-black text-white border-2 border-swatch-black p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-swatch-red mt-0.5" />
                <div>
                  <p className="font-black uppercase tracking-widest text-sm">Singapore Only</p>
                  <p className="text-xs opacity-75 mt-1">This queue is only available to customers physically in Singapore.</p>
                </div>
              </div>
            )}

            {(geoState === "denied" || geoState === "unavailable") && (
              <div className="border-2 border-red-400 bg-red-50 p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <p className="font-black uppercase tracking-widest text-sm text-red-800">
                    {geoState === "denied" ? "Location Access Denied" : "Location Unavailable"}
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    {geoState === "denied"
                      ? "Enable location permission in your browser settings then try again."
                      : "Ensure GPS is enabled on your device."}
                  </p>
                  <button onClick={handleLocationCheck} className="mt-2 text-xs font-black uppercase tracking-widest text-red-700 underline">
                    Try again
                  </button>
                </div>
              </div>
            )}

            {geoState === "approved" && (
              <>
                <div className="flex items-center gap-2 text-green-700 text-xs font-black uppercase tracking-widest">
                  <CheckCircle className="w-4 h-4" />
                  Location verified — you&apos;re in Singapore
                </div>

                <form onSubmit={handleJoin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2">Your Name</label>
                    <input
                      type="text"
                      className="w-full border-2 border-swatch-black px-4 py-3 font-bold focus:outline-none focus:border-swatch-red"
                      placeholder="e.g. Wei Lin"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2">Phone (SG)</label>
                    <input
                      type="tel"
                      className="w-full border-2 border-swatch-black px-4 py-3 font-bold focus:outline-none focus:border-swatch-red"
                      placeholder="+65 9123 4567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                    <p className="text-xs text-swatch-gray-mid mt-1">We&apos;ll SMS you when it&apos;s your turn.</p>
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50 text-base py-4">
                    {submitting ? "Joining..." : "Join Queue →"}
                  </button>
                  <p className="text-xs text-swatch-gray-mid text-center">
                    One slot per phone · Limit 1 watch per person · PDPA applies
                  </p>
                </form>
              </>
            )}
          </div>
        )}

        <Link href="/" className="block text-center text-xs font-black uppercase tracking-widest text-swatch-gray-mid hover:text-swatch-red mt-4">
          ← Back to drops
        </Link>
      </div>
    </main>
  );
}
