"use client";

import { useEffect, useState } from "react";
import { ServerCard } from "@/components/dashboard/ServerCard";
import { CallLog, LogEntry } from "@/components/dashboard/CallLog";
import { Activity, Server } from "lucide-react";
import { ServerMetrics } from "@/lib/reliability-store";

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Record<string, ServerMetrics>>({});
  const [activeServers, setActiveServers] = useState<string[]>([]);
  // Mock live logs for MVP since we don't persist logs in store yet
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("/api/metrics");
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.metrics) {
        setMetrics(data.metrics);
        setActiveServers(data.activeServers || []);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // For demo purposes, we randomly add a log entry if totalCalls changes
  useEffect(() => {
    let newLogs = [...logs];
    let changed = false;

    Object.entries(metrics).forEach(([server, m]) => {
      // Simulate recent log based on total calls
      const lastCalls = newLogs.filter(l => l.serverUsed === server).length;
      if (m.totalCalls > lastCalls) {
        newLogs.unshift({
          id: Math.random().toString(),
          timestamp: Date.now(),
          toolName: "unknown_tool", // In a real app, backend sends actual call stream
          serverUsed: server,
          latency: m.latencies[m.latencies.length - 1] || 0,
          success: m.successes > newLogs.filter(l => l.serverUsed === server && l.success).length,
          retries: 0
        });
        changed = true;
      }
    });

    if (changed) {
      if (newLogs.length > 50) newLogs = newLogs.slice(0, 50);
      setLogs(newLogs);
    }
  }, [metrics]);

  const totalCalls = Object.values(metrics).reduce((acc, m) => acc + m.totalCalls, 0);
  const overallSuccesses = Object.values(metrics).reduce((acc, m) => acc + m.successes, 0);
  const overallSuccessRate = totalCalls > 0 ? Math.round((overallSuccesses / totalCalls) * 100) : 100;

  return (
    <div className="space-y-8 pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Live Routing Dashboard</h1>
        <p className="text-gray-400">Monitor MCP server health, traffic, and routing decisions in real-time.</p>
      </header>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/20 text-primary rounded-xl">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm text-gray-400">Total Requests</div>
            <div className="text-3xl font-bold text-white">{totalCalls}</div>
          </div>
        </div>
        
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-400">Overall Success Rate</div>
            <div className="text-3xl font-bold text-white">{overallSuccessRate}%</div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-accent/20 text-accent rounded-xl">
            <Server className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm text-gray-400">Active Servers</div>
            <div className="text-3xl font-bold text-white">{activeServers.length}</div>
          </div>
        </div>
      </div>

      {/* Server Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">MCP Server Pool</h2>
        {Object.keys(metrics).length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-400">
            No servers are currently running. Create an endpoint first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(metrics).map(([name, m]) => (
              <ServerCard key={name} name={name} metrics={m} />
            ))}
          </div>
        )}
      </div>

      {/* Call Log */}
      <CallLog logs={logs} />
    </div>
  );
}
