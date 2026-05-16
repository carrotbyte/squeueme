"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import QRCode from "react-qr-code";
import { format } from "date-fns";
import { CheckCircle, Clock, MapPin, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface TicketData {
  id: string;
  position: number;
  displayName: string;
  status: string;
  qrToken: string;
  notifiedAt: string | null;
  event: {
    dropName: string;
    store: { name: string; mall: string };
  };
}

interface Stats { waiting: number; serving: number; completed: number }

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; message: string }> = {
  WAITING: {
    label: "Waiting",
    color: "bg-swatch-yellow text-black",
    icon: <Clock className="w-5 h-5" />,
    message: "Sit tight! We'll SMS you when it's almost your turn.",
  },
  NOTIFIED: {
    label: "Your Turn Soon!",
    color: "bg-swatch-red text-white",
    icon: <AlertCircle className="w-5 h-5" />,
    message: "Head to the store now and scan your QR at the counter.",
  },
  CHECKED_IN: {
    label: "Checked In",
    color: "bg-black text-white",
    icon: <CheckCircle className="w-5 h-5" />,
    message: "You're checked in! A staff member will call you shortly.",
  },
  SERVING: {
    label: "Being Served",
    color: "bg-black text-white",
    icon: <CheckCircle className="w-5 h-5" />,
    message: "You're at the counter — enjoy your Swatch!",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-black text-white",
    icon: <CheckCircle className="w-5 h-5" />,
    message: "Purchase complete. Thank you!",
  },
  NO_SHOW: {
    label: "No Show",
    color: "bg-gray-400 text-white",
    icon: <AlertCircle className="w-5 h-5" />,
    message: "Your slot was forfeited. Join again for the next drop.",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-gray-400 text-white",
    icon: <AlertCircle className="w-5 h-5" />,
    message: "Your ticket was cancelled.",
  },
};

export default function TicketPage() {
  const { qrToken } = useParams<{ qrToken: string }>();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets/${qrToken}`);
      if (!res.ok) return;
      const data = await res.json();
      setTicket(data.ticket);
      setStats(data.stats);
      setEta(data.eta);
    } finally {
      setLoading(false);
    }
  }, [qrToken]);

  useEffect(() => {
    fetchTicket();
    const interval = setInterval(fetchTicket, 30_000);
    return () => clearInterval(interval);
  }, [fetchTicket]);

  async function handleCheckIn() {
    setCheckingIn(true);
    try {
      const res = await fetch(`/api/tickets/${qrToken}/checkin`, { method: "POST" });
      if (res.ok) {
        toast.success("Checked in! Head to the counter.");
        fetchTicket();
      } else {
        const d = await res.json();
        toast.error(d.error ?? "Could not check in");
      }
    } finally {
      setCheckingIn(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-swatch-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="font-black text-2xl text-center">Ticket not found.</p>
        <Link href="/" className="btn-primary">Back to Events</Link>
      </div>
    );
  }

  const sc = statusConfig[ticket.status] ?? statusConfig["WAITING"];
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/ticket/${qrToken}`;

  return (
    <main className="min-h-screen bg-swatch-gray">
      <header className="bg-black text-white px-6 py-4">
        <span className="font-black uppercase tracking-widest">Swatch Queue</span>
      </header>

      <div className="max-w-md mx-auto px-4 py-8 space-y-4">
        {/* Status banner */}
        <div className={`${sc.color} p-4 flex items-center gap-3`}>
          {sc.icon}
          <div>
            <p className="font-black uppercase tracking-widest text-sm">{sc.label}</p>
            <p className="text-xs opacity-90">{sc.message}</p>
          </div>
        </div>

        {/* Ticket card */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-swatch-gray-mid">Queue Number</p>
              <p className="text-7xl font-black text-swatch-red leading-none">#{ticket.position}</p>
              <p className="font-bold text-lg mt-1">{ticket.displayName}</p>
            </div>
            {/* QR Code */}
            <div className="border-2 border-black p-2 bg-white">
              <QRCode value={qrUrl} size={90} />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-swatch-gray-light space-y-2 text-sm">
            <div className="flex items-center gap-2 text-swatch-gray-mid">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{ticket.event.store.name} · {ticket.event.store.mall}</span>
            </div>
            {ticket.status === "WAITING" && eta && (
              <div className="flex items-center gap-2 text-swatch-gray-mid">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Est. wait until {format(new Date(eta), "h:mm a")}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          {stats && ticket.status === "WAITING" && (
            <div className="mt-4 grid grid-cols-2 gap-3 bg-swatch-gray p-3">
              <div className="text-center">
                <p className="text-2xl font-black">{stats.waiting}</p>
                <p className="text-xs uppercase tracking-widest font-bold text-swatch-gray-mid">Ahead of you</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-swatch-red">{stats.serving}</p>
                <p className="text-xs uppercase tracking-widest font-bold text-swatch-gray-mid">Being served</p>
              </div>
            </div>
          )}
        </div>

        {/* Check-in button */}
        {ticket.status === "NOTIFIED" && (
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="btn-primary w-full text-lg py-5 disabled:opacity-50"
          >
            {checkingIn ? "Checking in..." : "I'm Here! ✓"}
          </button>
        )}

        <p className="text-xs text-center text-swatch-gray-mid font-bold uppercase tracking-widest">
          {ticket.event.dropName} · Auto-refreshes every 30s
        </p>

        <Link
          href="/"
          className="block text-center text-xs font-black uppercase tracking-widest text-swatch-gray-mid hover:text-swatch-red mt-4"
        >
          ← Back to Events
        </Link>
      </div>
    </main>
  );
}
