"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, CheckCircle, XCircle, PlayCircle, RefreshCw, LogOut } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Queue { id: string; dropName: string; status: string; startsAt: string; store: { name: string }; _count: { tickets: number } }
interface Ticket { id: string; position: number; displayName: string; status: string; notifiedAt: string | null; checkInAt: string | null }
interface Stats { waiting: number; serving: number; completed: number }

const statusColors: Record<string, string> = {
  WAITING:    "border-l-swatch-yellow",
  NOTIFIED:   "border-l-swatch-red",
  CHECKED_IN: "border-l-swatch-black",
  SERVING:    "border-l-swatch-black",
};
const statusLabels: Record<string, string> = {
  WAITING:    "Waiting",
  NOTIFIED:   "Notified",
  CHECKED_IN: "Checked In",
  SERVING:    "Serving",
};

export default function StaffDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [staffInfo, setStaffInfo] = useState<{ name: string; role: string } | null>(null);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<string>("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("staff_token");
    const si = localStorage.getItem("staff_info");
    if (!t) { router.push("/staff"); return; }
    setToken(t);
    if (si) setStaffInfo(JSON.parse(si));
  }, [router]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/events")
      .then((r) => r.json())
      .then((data: Queue[]) => {
        setQueues(data);
        if (data.length > 0) setSelectedQueue(data[0].id);
      });
  }, [token]);

  const fetchQueue = useCallback(async () => {
    if (!token || !selectedQueue) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/queue?eventId=${selectedQueue}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTickets(data.tickets ?? []);
      setStats(data.stats ?? null);
    } finally {
      setLoading(false);
    }
  }, [token, selectedQueue]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15_000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  async function staffAction(action: string, ticketId?: string, count?: number) {
    if (!token) return;
    try {
      const res = await fetch("/api/staff/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, ticketId, eventId: selectedQueue, count }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Action failed"); return; }
      if (action === "callNext") toast.success(`Called ${data.called} customer(s)`);
      else toast.success("Updated!");
      fetchQueue();
    } catch { toast.error("Network error"); }
  }

  function handleLogout() {
    localStorage.removeItem("staff_token");
    localStorage.removeItem("staff_info");
    router.push("/staff");
  }

  const currentQueue = queues.find((q) => q.id === selectedQueue);

  return (
    <main className="min-h-screen bg-swatch-gray">
      {/* Header */}
      <header className="bg-swatch-black text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-swatch-red rounded-full" />
          <span className="font-black uppercase tracking-widest text-sm">Staff Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          {staffInfo && <span className="text-xs text-gray-400 font-bold">{staffInfo.name}</span>}
          <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Queue selector */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-swatch-gray-mid mb-2">Active Queue</label>
          <select
            className="w-full border-2 border-swatch-black px-4 py-3 font-bold bg-white focus:outline-none focus:border-swatch-red"
            value={selectedQueue}
            onChange={(e) => setSelectedQueue(e.target.value)}
          >
            {queues.map((q) => (
              <option key={q.id} value={q.id}>
                {q.dropName} · {q.store.name} · {format(new Date(q.startsAt), "d MMM h:mm a")}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Waiting",  value: stats.waiting,   icon: <Users className="w-4 h-4" />,        color: "text-swatch-yellow" },
              { label: "Serving",  value: stats.serving,   icon: <PlayCircle className="w-4 h-4" />,   color: "text-swatch-red" },
              { label: "Done",     value: stats.completed, icon: <CheckCircle className="w-4 h-4" />,  color: "text-swatch-black" },
            ].map((s) => (
              <div key={s.label} className="card p-3 text-center">
                <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[11px] font-black uppercase tracking-widest text-swatch-gray-mid">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => { setCalling(true); staffAction("callNext", undefined, 5).finally(() => setCalling(false)); }}
            disabled={calling}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-50"
          >
            <PlayCircle className="w-4 h-4" />
            {calling ? "Calling…" : "Call Next 5"}
          </button>
          <button onClick={fetchQueue} disabled={loading} className="btn-outline px-4 py-3 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Queue info */}
        {currentQueue && (
          <p className="text-xs text-swatch-gray-mid font-bold uppercase tracking-widest">
            {currentQueue._count.tickets} total joined · auto-refreshes every 15s
          </p>
        )}

        {/* Queue list */}
        <div className="space-y-2">
          {tickets.length === 0 ? (
            <div className="card text-center py-10">
              <p className="font-black text-swatch-gray-mid uppercase tracking-widest text-sm">Queue is empty</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`bg-white border-2 border-swatch-gray-light border-l-4 ${statusColors[ticket.status] ?? "border-l-gray-300"} px-4 py-3`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black text-swatch-red w-12 shrink-0">#{ticket.position}</span>
                    <div>
                      <p className="font-black text-sm">{ticket.displayName}</p>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-swatch-gray-mid">
                        {statusLabels[ticket.status] ?? ticket.status}
                        {ticket.notifiedAt && ` · SMS ${format(new Date(ticket.notifiedAt), "h:mm a")}`}
                        {ticket.checkInAt && ` · In ${format(new Date(ticket.checkInAt), "h:mm a")}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {ticket.status === "CHECKED_IN" && (
                      <button onClick={() => staffAction("markServing", ticket.id)} className="btn-primary py-1.5 px-3 text-xs">
                        Serve
                      </button>
                    )}
                    {ticket.status === "SERVING" && (
                      <button onClick={() => staffAction("markCompleted", ticket.id)} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Done
                      </button>
                    )}
                    {(ticket.status === "NOTIFIED" || ticket.status === "CHECKED_IN") && (
                      <button onClick={() => staffAction("markNoShow", ticket.id)} className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> No Show
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
