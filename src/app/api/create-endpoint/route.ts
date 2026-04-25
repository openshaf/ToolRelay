import { NextResponse } from "next/server";
import { store, EndpointConfig } from "@/lib/reliability-store";
import { pool } from "@/lib/mcp-pool";

export async function POST(req: Request) {
  try {
    const { name, description, servers } = await req.json();

    if (!name || !servers || !Array.isArray(servers) || servers.length === 0) {
      return NextResponse.json({ error: "Invalid endpoint configuration" }, { status: 400 });
    }

    // Generate unique ID
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substr(2, 5);

    const config: EndpointConfig = {
      id,
      name,
      description,
      servers,
      createdAt: Date.now()
    };

    // Save to store
    store.saveConfig(config);

    // Pre-warm servers in background
    for (const serverName of servers) {
      pool.startServer(serverName).catch(e => console.error(`Failed to prewarm ${serverName}:`, e));
    }

    return NextResponse.json({ success: true, id, config });
  } catch (error: any) {
    console.error("Create Endpoint Error:", error);
    return NextResponse.json(
      { error: "Failed to create endpoint", details: error.message },
      { status: 500 }
    );
  }
}
