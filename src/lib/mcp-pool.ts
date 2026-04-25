import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SERVER_REGISTRY } from "./server-registry";
import { store } from "./reliability-store";

export interface ActiveServer {
  name: string;
  client: Client;
  transport: StdioClientTransport;
  tools: any[];
}

class McpPool {
  private activeServers: Map<string, ActiveServer> = new Map();

  async startServer(name: string) {
    if (this.activeServers.has(name)) {
      return this.activeServers.get(name);
    }

    const def = SERVER_REGISTRY[name];
    if (!def) throw new Error(`Server ${name} not found in registry`);

    console.log(`Starting MCP server: ${name}...`);

    const transport = new StdioClientTransport({
      command: def.command,
      args: def.args,
    });

    const client = new Client(
      {
        name: "toolrelay-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    try {
      await client.connect(transport);
      
      // Fetch available tools
      const toolsResponse = await client.request({ method: "tools/list" }, require("zod").any());
      const tools = (toolsResponse as any).tools || [];
      
      this.activeServers.set(name, {
        name,
        client,
        transport,
        tools
      });

      store.updateStatus(name, 'live');
      return this.activeServers.get(name);
    } catch (err) {
      console.error(`Failed to start server ${name}:`, err);
      store.updateStatus(name, 'down');
      throw err;
    }
  }

  getServer(name: string) {
    return this.activeServers.get(name);
  }

  getAllServers() {
    return Array.from(this.activeServers.values());
  }

  async stopServer(name: string) {
    const server = this.activeServers.get(name);
    if (server) {
      await server.client.close();
      this.activeServers.delete(name);
      store.updateStatus(name, 'down');
    }
  }

  // Helper: call a tool on a specific server
  async callTool(serverName: string, toolName: string, args: any) {
    const server = await this.startServer(serverName);
    if (!server) throw new Error(`Could not start server ${serverName}`);

    const startTime = Date.now();
    try {
      const response = await server.client.request(
        {
          method: "tools/call",
          params: { name: toolName, arguments: args }
        },
        require("zod").any()
      );
      store.recordCall(serverName, true, Date.now() - startTime);
      return response;
    } catch (e: any) {
      store.recordCall(serverName, false, Date.now() - startTime);
      throw e;
    }
  }
}

export const pool = new McpPool();
