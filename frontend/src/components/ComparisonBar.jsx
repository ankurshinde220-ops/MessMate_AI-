"use client";

import Link from "next/link";
import { useMessMate } from "@/context/MessMateContext";
import { MOCK_MESSES } from "@/data/mockData";
import { Scale, X, ArrowRight } from "lucide-react";

export default function ComparisonBar() {
  const { comparisonList, toggleCompare, clearCompare } = useMessMate();

  if (comparisonList.length === 0) return null;

  const selectedMesses = MOCK_MESSES.filter(m => comparisonList.includes(m.id));

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-3xl animate-bounce-in">
      <div className="bg-navy-950/95 backdrop-blur-md text-white rounded-2xl p-3 sm:p-4 border border-navy-800 shadow-soft-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-300 block">Compare Messes ({comparisonList.length}/3)</span>
            <div className="flex items-center gap-2 mt-1">
              {selectedMesses.map(mess => (
                <div
                  key={mess.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-800 border border-navy-700 text-[11px] font-semibold text-white"
                >
                  <span className="max-w-[100px] truncate">{mess.name}</span>
                  <button
                    onClick={() => toggleCompare(mess.id)}
                    className="p-0.5 hover:text-rose-400"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={clearCompare}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Clear
          </button>
          <Link
            href="/compare"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-black text-xs shadow-emerald-glow transition-all active:scale-95"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
