import fs from 'fs';
import path from 'path';

export interface ServerMetrics {
  totalCalls: number;
  successes: number;
  failures: number;
  latencies: number[];
  status: 'live' | 'degraded' | 'down';
  lastPing?: number;
}

export interface EndpointConfig {
  id: string;
  name: string;
  description: string;
  servers: string[];
  createdAt: number;
}

class ReliabilityStore {
  private metrics: Record<string, ServerMetrics> = {};
  private configs: Record<string, EndpointConfig> = {};
  private dataDir = path.join(process.cwd(), 'data');

  constructor() {
    this.initDirs();
    this.loadData();
  }

  private initDirs() {
    if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir);
    if (!fs.existsSync(path.join(this.dataDir, 'metrics'))) fs.mkdirSync(path.join(this.dataDir, 'metrics'));
    if (!fs.existsSync(path.join(this.dataDir, 'configs'))) fs.mkdirSync(path.join(this.dataDir, 'configs'));
  }

  private loadData() {
    try {
      const metricsFile = path.join(this.dataDir, 'metrics', 'metrics.json');
      if (fs.existsSync(metricsFile)) {
        this.metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
      }
      
      const configsFile = path.join(this.dataDir, 'configs', 'configs.json');
      if (fs.existsSync(configsFile)) {
        this.configs = JSON.parse(fs.readFileSync(configsFile, 'utf-8'));
      }
    } catch (e) {
      console.error("Failed to load store data:", e);
    }
  }

  private saveData() {
    fs.writeFileSync(path.join(this.dataDir, 'metrics', 'metrics.json'), JSON.stringify(this.metrics, null, 2));
    fs.writeFileSync(path.join(this.dataDir, 'configs', 'configs.json'), JSON.stringify(this.configs, null, 2));
  }

  // --- Metrics API ---

  public getServerMetrics(serverName: string): ServerMetrics {
    if (!this.metrics[serverName]) {
      this.metrics[serverName] = {
        totalCalls: 0,
        successes: 0,
        failures: 0,
        latencies: [],
        status: 'down'
      };
    }
    return this.metrics[serverName];
  }

  public getAllMetrics() {
    return this.metrics;
  }

  public recordCall(serverName: string, success: boolean, latencyMs: number) {
    const m = this.getServerMetrics(serverName);
    m.totalCalls++;
    if (success) {
      m.successes++;
    } else {
      m.failures++;
    }
    m.latencies.push(latencyMs);
    if (m.latencies.length > 50) m.latencies.shift(); // Keep last 50
    this.saveData();
  }

  public updateStatus(serverName: string, status: 'live' | 'degraded' | 'down') {
    const m = this.getServerMetrics(serverName);
    m.status = status;
    m.lastPing = Date.now();
    this.saveData();
  }

  // --- Configs API ---

  public saveConfig(config: EndpointConfig) {
    this.configs[config.id] = config;
    this.saveData();
  }

  public getConfig(id: string) {
    return this.configs[id];
  }

  public getAllConfigs() {
    return this.configs;
  }
}

export const store = new ReliabilityStore();
