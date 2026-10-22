import Link from "next/link";
import { Utensils, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white">MessMate AI</span>
            </div>
            <p className="max-w-md text-slate-400 text-xs leading-relaxed">
              MessMate AI empowers college students and young professionals to discover affordable, hygienic, and verified messes. Explore weekly menus, real reviews, and smart AI matching based on your budget and dietary needs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/messes" className="hover:text-white transition-colors">Discover Messes</Link></li>
              <li><Link href="/compare" className="hover:text-white transition-colors">Compare Prices & Menus</Link></li>
              <li><Link href="/recommendations" className="hover:text-white transition-colors">AI Recommendation Engine</Link></li>
              <li><Link href="/favorites" className="hover:text-white transition-colors">Saved Messes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Technology Stack</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Next.js 14, Tailwind CSS, Leaflet & OpenStreetMap, Python FastAPI, PostgreSQL, and Scikit-learn.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MessMate AI. Built for student communities.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for hostelites.
          </p>
        </div>
      </div>
    </footer>
  );
}
