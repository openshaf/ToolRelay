import Link from "next/link";
import { Activity, Zap } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-border-light bg-[#F5F1E3]/80">
      <Link href="/" className="flex items-center gap-2.5 text-xl font-bold font-[family-name:var(--font-instrument-sans)]">
        <div className="p-1.5 bg-primary rounded-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-[#1A1A1A]">Tool<span className="text-primary">Relay</span></span>
      </Link>
      
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-text-muted hover:text-[#1A1A1A] transition-colors font-[family-name:var(--font-instrument-sans)]">
          <Activity className="w-4 h-4" />
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
