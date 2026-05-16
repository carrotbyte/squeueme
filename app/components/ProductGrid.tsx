"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { CatalogItem, Store } from "@/lib/mock-store";
import { stockLeft } from "@/lib/mock-store";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function displayName(name: string) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function StockPill({ left, total }: { left: number; total: number }) {
  const soldOut = left === 0;
  const low = !soldOut && left / total <= 0.2;
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 ${
      soldOut ? "bg-swatch-gray-light text-swatch-gray-mid"
      : low    ? "bg-swatch-red text-white"
               : "bg-green-100 text-green-700"
    }`}>
      {soldOut ? "Sold out" : `${left} left`}
    </span>
  );
}

function StockBar({ left, total }: { left: number; total: number }) {
  const pct = total > 0 ? (left / total) * 100 : 0;
  const soldOut = left === 0;
  const low = !soldOut && pct <= 20;
  return (
    <div className="w-full h-1.5 bg-swatch-gray-light overflow-hidden">
      <div
        className={`h-full transition-all ${soldOut ? "bg-swatch-gray-light" : low ? "bg-swatch-red" : "bg-green-500"}`}
        style={{ width: `${Math.max(soldOut ? 0 : 3, pct)}%` }}
      />
    </div>
  );
}

// ─── Image Modal ──────────────────────────────────────────────────────────────

function ImageModal({ item, onClose }: { item: CatalogItem; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  // Fade + scale in on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Animate out then call onClose
  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 220);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  function prev() { setIdx((i) => (i - 1 + item.images.length) % item.images.length); }
  function next() { setIdx((i) => (i + 1) % item.images.length); }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{
        backgroundColor: `rgba(0,0,0,${visible ? 0.85 : 0})`,
        transition: "background-color 220ms ease",
      }}
      onClick={handleClose}
    >
      <div
        className="relative w-full bg-white shadow-2xl flex flex-col"
        style={{
          maxWidth: 780,
          maxHeight: "90vh",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.94) translateY(24px)",
          transition: "opacity 220ms ease, transform 220ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-swatch-black text-white shrink-0">
          <div>
            <p className="font-black uppercase tracking-widest">{displayName(item.name)}</p>
            <p className="text-swatch-red font-black text-sm mt-0.5">{item.price} · {item.ref}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center text-white hover:text-swatch-red hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main image */}
        <div className="relative bg-swatch-gray flex-1 overflow-hidden" style={{ minHeight: 420 }}>
          <Image
            key={item.images[idx]}
            src={item.images[idx]}
            alt={`${displayName(item.name)} ${idx + 1}`}
            fill
            className="object-contain p-8 transition-opacity duration-200"
            unoptimized
          />

          {item.images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white border-2 border-swatch-black flex items-center justify-center hover:bg-swatch-red hover:text-white hover:border-swatch-red transition-colors shadow-md"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white border-2 border-swatch-black flex items-center justify-center hover:bg-swatch-red hover:text-white hover:border-swatch-red transition-colors shadow-md"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Counter badge */}
          <div className="absolute bottom-3 right-4 bg-black/60 text-white text-xs font-black uppercase tracking-widest px-2.5 py-1">
            {idx + 1} / {item.images.length}
          </div>
        </div>

        {/* Thumbnail strip */}
        {item.images.length > 1 && (
          <div className="flex gap-2 px-5 py-3 overflow-x-auto bg-white border-t-2 border-swatch-gray-light shrink-0">
            {item.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`shrink-0 w-16 h-16 border-2 transition-all overflow-hidden bg-swatch-gray ${
                  i === idx
                    ? "border-swatch-red scale-105 shadow-md"
                    : "border-swatch-gray-light hover:border-swatch-black"
                }`}
                style={{ transition: "border-color 150ms, transform 150ms, box-shadow 150ms" }}
              >
                <Image
                  src={src}
                  alt={`thumb ${i + 1}`}
                  width={64}
                  height={64}
                  className="object-contain w-full h-full p-1"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product Grid ─────────────────────────────────────────────────────────────

export function ProductGrid({ catalog, stores }: { catalog: CatalogItem[]; stores: Store[] }) {
  const [selected, setSelected] = useState<CatalogItem | null>(null);

  function totalLeft(item: CatalogItem) {
    return Object.keys(item.stock).reduce((s, sid) => s + stockLeft(item, sid), 0);
  }
  function totalUnits(item: CatalogItem) {
    return Object.values(item.stock).reduce((s, v) => s + v.total, 0);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        {catalog.map((item) => {
          const overall = totalLeft(item);
          const total = totalUnits(item);
          return (
            <button
              key={item.ref}
              onClick={() => setSelected(item)}
              className="w-full text-left border-2 border-swatch-gray-light hover:border-swatch-black transition-colors group"
            >
              <div className="flex items-stretch gap-0">
                {/* Watch image */}
                <div
                  className="w-24 shrink-0 flex items-center justify-center py-3 px-2 group-hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: item.colorHex + "20" }}
                >
                  <Image
                    src={item.img}
                    alt={displayName(item.name)}
                    width={60}
                    height={84}
                    className="object-contain drop-shadow-sm"
                    unoptimized
                  />
                </div>

                {/* Info */}
                <div className="flex-1 p-4 border-l-2 border-swatch-gray-light">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-black uppercase text-sm leading-tight">{displayName(item.name)}</p>
                      <p className="text-[11px] text-swatch-gray-mid mt-0.5 font-mono">{item.ref}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-black text-sm text-swatch-black">{item.price}</span>
                      <StockPill left={overall} total={total} />
                    </div>
                  </div>

                  {/* Per-store stock */}
                  <div className="mt-3 space-y-2">
                    {stores.map((store) => {
                      const left = stockLeft(item, store.id);
                      const storeTotal = item.stock[store.id]?.total ?? 0;
                      return (
                        <div key={store.id}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] text-swatch-gray-mid font-bold truncate">{store.mall}</span>
                            <span className={`text-[11px] font-black ${
                              left === 0 ? "text-swatch-gray-mid"
                              : left / storeTotal <= 0.2 ? "text-swatch-red"
                              : "text-green-600"
                            }`}>
                              {left === 0 ? "Sold out" : `${left}/${storeTotal}`}
                            </span>
                          </div>
                          <StockBar left={left} total={storeTotal} />
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-swatch-gray-mid mt-2 font-bold uppercase tracking-widest group-hover:text-swatch-red transition-colors">
                    Tap to view photos →
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && <ImageModal item={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
