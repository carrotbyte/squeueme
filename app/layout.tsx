import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Swatch Queue",
  description: "Skip the overnight line. Join the Swatch virtual queue.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#FF0000" />
      </head>
      <body className={`${inter.variable} font-sans bg-white text-swatch-black antialiased`}>
        {children}
        <Analytics />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: "#000", color: "#fff", borderRadius: "0px", fontWeight: "600" },
            success: { iconTheme: { primary: "#FF0000", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
