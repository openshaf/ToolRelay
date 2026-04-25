import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "./StatusBadge";
import { Server, Activity, CheckCircle2, XCircle } from "lucide-react";
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
    <GlassCard className="flex flex-col h-full relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
            <Server className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white capitalize">{name}</h3>
        </div>
        <StatusBadge status={metrics.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Success Rate
          </div>
          <div className="text-2xl font-semibold text-white">{successRate}%</div>
        </div>
        
        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Activity className="w-4 h-4 text-accent" />
            Avg Latency
          </div>
          <div className="text-2xl font-semibold text-white">{avgLatency}ms</div>
        </div>

        <div className="col-span-2 bg-black/20 rounded-xl p-3 border border-white/5 flex justify-between items-center">
          <div className="text-sm text-gray-400">Total Requests</div>
          <div className="font-mono text-gray-200">{metrics.totalCalls}</div>
        </div>
      </div>
    </GlassCard>
  );
}
