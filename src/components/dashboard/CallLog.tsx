import { GlassCard } from "@/components/ui/GlassCard";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export interface LogEntry {
  id: string;
  timestamp: number;
  toolName: string;
  serverUsed: string;
  latency: number;
  success: boolean;
  retries: number;
}

interface CallLogProps {
  logs: LogEntry[];
}

export function CallLog({ logs }: CallLogProps) {
  return (
    <GlassCard className="col-span-full xl:col-span-2 overflow-hidden flex flex-col">
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4 font-[family-name:var(--font-instrument-serif)]">Live Routing Log</h3>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left font-[family-name:var(--font-instrument-sans)]">
          <thead className="text-xs text-text-muted uppercase bg-surface-warm tracking-[0.15em]">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Status</th>
              <th className="px-4 py-3">Tool Call</th>
              <th className="px-4 py-3">Routed To</th>
              <th className="px-4 py-3">Latency</th>
              <th className="px-4 py-3">Retries</th>
              <th className="px-4 py-3 rounded-tr-lg text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  No tool calls recorded yet. Waiting for traffic...
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-border-light last:border-0 hover:bg-surface-warm/60 transition-colors">
                  <td className="px-4 py-3">
                    {log.success ? (
                      <CheckCircle2 className="w-5 h-5 text-[#2D8A4E]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[#C23B22]" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-text-secondary">{log.toolName}</td>
                  <td className="px-4 py-3 text-[#1A1A1A] capitalize">{log.serverUsed}</td>
                  <td className="px-4 py-3 text-text-muted">{log.latency}ms</td>
                  <td className="px-4 py-3">
                    {log.retries > 0 ? (
                      <span className="px-2 py-1 bg-[#C97A2E]/10 text-[#C97A2E] rounded-md text-xs font-bold">
                        {log.retries} retries
                      </span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-text-muted whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
