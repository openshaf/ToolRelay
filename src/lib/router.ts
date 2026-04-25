import { store } from "./reliability-store";
import { pool } from "./mcp-pool";

export class SmartRouter {
  /**
   * Finds the best server that provides the requested tool based on reliability metrics.
   */
  static async route(toolName: string, endpointId: string): Promise<string | null> {
    const config = store.getConfig(endpointId);
    if (!config) throw new Error("Endpoint configuration not found");

    const availableServers = config.servers;
    const candidates: string[] = [];

    // Filter servers that actually have the tool
    for (const serverName of availableServers) {
      try {
        const server = await pool.startServer(serverName);
        if (server && server.tools.find((t: any) => t.name === toolName)) {
          candidates.push(serverName);
        }
      } catch (e) {
        // Skip failed servers
      }
    }

    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    // Score candidates: successRate * 0.6 + (1/latency) * 0.3
    const scored = candidates.map(serverName => {
      const metrics = store.getServerMetrics(serverName);
      let successRate = 1; // Default optimistic
      if (metrics.totalCalls > 0) {
        successRate = metrics.successes / metrics.totalCalls;
      }
      
      let avgLatency = 500; // Default 500ms
      if (metrics.latencies.length > 0) {
        avgLatency = metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length;
      }
      
      const latencyScore = Math.min(1000 / Math.max(avgLatency, 10), 1); // 0 to 1
      const score = (successRate * 0.7) + (latencyScore * 0.3);

      return { serverName, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    
    // Return highest scoring server
    return scored[0].serverName;
  }
}
