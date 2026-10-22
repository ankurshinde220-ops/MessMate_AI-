import "./globals.css";
import { MessMateProvider } from "@/context/MessMateContext";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "MessMate AI",
  description: "Discover verified messes near your college or hostel. Compare weekly menus, meal prices, hygiene ratings, and get AI-powered personalized food recommendations.",
  keywords: ["MessMate AI", "mess discovery", "student mess", "college food", "mess recommendation AI", "tiffin service", "Pune messes", "hostel food"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF8F5] text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <MessMateProvider>
          <AppShell>{children}</AppShell>
        </MessMateProvider>
      </body>
    </html>
  );
}

