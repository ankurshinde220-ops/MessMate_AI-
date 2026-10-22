"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ComparisonBar from "@/components/ComparisonBar";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/" || pathname === "/login";

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5] text-slate-900">
        <main className="flex-grow flex items-center justify-center">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <ComparisonBar />
      <Footer />
    </div>
  );
}
