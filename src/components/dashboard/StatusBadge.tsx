import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "live" | "degraded" | "down";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    live: "bg-green-500/10 text-green-400 border-green-500/20",
    degraded: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    down: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className={cn("px-2.5 py-0.5 rounded-full border text-xs font-medium uppercase tracking-wider flex items-center gap-1.5", styles[status])}>
      <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-green-400": status === "live",
        "bg-yellow-400": status === "degraded",
        "bg-red-400": status === "down",
      })}></span>
      {status}
    </div>
  );
}
