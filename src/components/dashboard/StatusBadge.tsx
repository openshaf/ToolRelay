import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "live" | "degraded" | "down";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    live: "bg-[#2D8A4E]/10 text-[#2D8A4E] border-[#2D8A4E]/20",
    degraded: "bg-[#C97A2E]/10 text-[#C97A2E] border-[#C97A2E]/20",
    down: "bg-[#C23B22]/10 text-[#C23B22] border-[#C23B22]/20",
  };

  return (
    <div className={cn("px-2.5 py-0.5 rounded-full border text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-1.5 font-[family-name:var(--font-instrument-sans)]", styles[status])}>
      <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-[#2D8A4E]": status === "live",
        "bg-[#C97A2E]": status === "degraded",
        "bg-[#C23B22]": status === "down",
      })}></span>
      {status}
    </div>
  );
}
