import Link from "next/link";
import { Activity, Zap } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5 bg-[#0a0a1a]/80">
      <Link href="/" className="flex items-center gap-2 text-xl font-bold">
        <Zap className="w-6 h-6 text-primary" />
        <span className="text-white">Tool<span className="text-accent">Relay</span></span>
      </Link>
      
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
          <Activity className="w-4 h-4" />
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
