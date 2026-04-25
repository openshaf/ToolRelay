import Link from "next/link";
import { Activity, Zap } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end px-6 py-4 backdrop-blur-md border-b border-border-light bg-[#F5F1E3]/80">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="px-4 py-2 text-2xl font-bold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors font-[family-name:var(--font-oswald)]">
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
