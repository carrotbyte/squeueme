"use client";

import { useState } from "react";
import { X, Newspaper, ExternalLink } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Collection:    "bg-swatch-red text-white",
  Collaboration: "bg-swatch-black text-white",
  Event:         "bg-swatch-yellow text-swatch-black",
  Brand:         "bg-swatch-gray-mid text-white",
  Financial:     "bg-green-600 text-white",
};

export function NewsDrawer({ news }: { news: NewsItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Swatch News"
      >
        <Newspaper className="w-4 h-4" />
        <span className="hidden sm:inline">News</span>
        {news.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-swatch-red rounded-full text-[8px] font-black flex items-center justify-center">
            {news.length}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="bg-swatch-black text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-swatch-red" />
            <span className="font-black uppercase tracking-widest text-sm">Swatch News</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-white hover:text-swatch-red transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-swatch-gray-light">
          {news.length === 0 ? (
            <div className="p-8 text-center">
              <Newspaper className="w-8 h-8 mx-auto text-swatch-gray-light mb-3" />
              <p className="font-bold uppercase tracking-widest text-sm text-swatch-black">No news loaded</p>
            </div>
          ) : (
            news.map((item) => (
              <div key={item.id} className="px-5 py-4 hover:bg-swatch-gray transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 ${CATEGORY_COLORS[item.category] ?? "bg-swatch-black text-white"}`}>
                    {item.category}
                  </span>
                  <span className="text-[11px] text-swatch-black font-bold">{item.date}</span>
                </div>
                <p className="font-black text-sm leading-snug mb-1 text-swatch-black">{item.title}</p>
                <p className="text-xs text-swatch-black leading-relaxed">{item.summary}</p>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-widest text-swatch-black">
                  <ExternalLink className="w-3 h-3" />
                  swatch.com
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t-2 border-swatch-gray-light px-5 py-3 text-center shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-swatch-black">
            Mock data · For display only
          </p>
        </div>
      </div>
    </>
  );
}
