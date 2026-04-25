import { NextResponse } from "next/server";
import { store } from "@/lib/reliability-store";
import { pool } from "@/lib/mcp-pool";
import { RetryEngine } from "@/lib/retry-engine";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const config = store.getConfig(id);
    if (!config) {
      return NextResponse.json({ jsonrpc: "2.0", error: { code: -32000, message: "Endpoint not found" }, id: null });
    }

    const rpcRequest = await req.json();
    const { jsonrpc, method, params: rpcParams, id: msgId } = rpcRequest;

    if (jsonrpc !== "2.0" || !method) {
      return NextResponse.json({ jsonrpc: "2.0", error: { code: -32600, message: "Invalid Request" }, id: msgId || null });
    }

    // Handle standard MCP methods
    if (method === "tools/list") {
      let allTools: any[] = [];
      for (const serverName of config.servers) {
        try {
          const server = await pool.startServer(serverName);
          if (server) {
            allTools = allTools.concat(server.tools);
          }
        } catch (e) {
          console.error(`Failed to get tools for ${serverName}`, e);
        }
      }
      return NextResponse.json({
        jsonrpc: "2.0",
        id: msgId,
        result: { tools: allTools }
      });
    }

    if (method === "tools/call") {
      const toolName = rpcParams.name;
      const toolArgs = rpcParams.arguments || {};

      try {
        // We don't have expected schema immediately available without another tools/list lookup.
        // For MVP, we will try to look it up from the loaded tools.
        let expectedSchema = {};
        const servers = pool.getAllServers();
        for (const s of servers) {
          const t = s.tools.find((t: any) => t.name === toolName);
          if (t) {
            expectedSchema = t.inputSchema || {};
            break;
          }
        }

        const result = await RetryEngine.executeWithRetry(id, toolName, toolArgs, expectedSchema);
        
        return NextResponse.json({
          jsonrpc: "2.0",
          id: msgId,
          result: result.result
        });
      } catch (err: any) {
        return NextResponse.json({
          jsonrpc: "2.0",
          id: msgId,
          error: { code: -32000, message: err.message }
        });
      }
    }

    // Unsupported method
    return NextResponse.json({
      jsonrpc: "2.0",
      id: msgId,
      error: { code: -32601, message: "Method not found" }
    });

  } catch (err: any) {
    console.error("MCP Proxy Error:", err);
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null }
    );
  }
}
