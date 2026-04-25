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
      <h3 className="text-lg font-semibold text-white mb-4">Live Routing Log</h3>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase bg-black/20">
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
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No tool calls recorded yet. Waiting for traffic...
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    {log.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-300">{log.toolName}</td>
                  <td className="px-4 py-3 text-white capitalize">{log.serverUsed}</td>
                  <td className="px-4 py-3 text-gray-400">{log.latency}ms</td>
                  <td className="px-4 py-3">
                    {log.retries > 0 ? (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-md text-xs">
                        {log.retries} retries
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
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
