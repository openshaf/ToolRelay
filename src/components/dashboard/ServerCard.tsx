import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "./StatusBadge";
import { Server, Activity, CheckCircle2 } from "lucide-react";
import { ServerMetrics } from "@/lib/reliability-store";

interface ServerCardProps {
  name: string;
  metrics: ServerMetrics;
}

export function ServerCard({ name, metrics }: ServerCardProps) {
  const successRate = metrics.totalCalls > 0 
    ? Math.round((metrics.successes / metrics.totalCalls) * 100) 
    : 100;

  const avgLatency = metrics.latencies.length > 0
    ? Math.round(metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length)
    : 0;

  return (
    <GlassCard className="flex flex-col h-full relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Server className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#1A1A1A] capitalize font-[family-name:var(--font-instrument-serif)]">{name}</h3>
        </div>
        <StatusBadge status={metrics.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="bg-surface-warm rounded-xl p-3 border border-border-light">
          <div className="flex items-center gap-2 text-text-muted text-sm mb-1 font-[family-name:var(--font-instrument-sans)]">
            <CheckCircle2 className="w-4 h-4 text-[#2D8A4E]" />
            Success Rate
          </div>
          <div className="text-2xl font-semibold text-[#1A1A1A] font-[family-name:var(--font-instrument-sans)]">{successRate}%</div>
        </div>
        
        <div className="bg-surface-warm rounded-xl p-3 border border-border-light">
          <div className="flex items-center gap-2 text-text-muted text-sm mb-1 font-[family-name:var(--font-instrument-sans)]">
            <Activity className="w-4 h-4 text-primary" />
            Avg Latency
          </div>
          <div className="text-2xl font-semibold text-[#1A1A1A] font-[family-name:var(--font-instrument-sans)]">{avgLatency}ms</div>
        </div>

        <div className="col-span-2 bg-surface-warm rounded-xl p-3 border border-border-light flex justify-between items-center">
          <div className="text-sm text-text-muted font-[family-name:var(--font-instrument-sans)]">Total Requests</div>
          <div className="font-mono text-text-secondary">{metrics.totalCalls}</div>
        </div>
      </div>
    </GlassCard>
  );
}
