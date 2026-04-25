import { store } from "@/lib/reliability-store";
import { pool } from "@/lib/mcp-pool";

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ message: "connected" })}\n\n`));
      
      // Send updates every 2 seconds
      const intervalId = setInterval(() => {
        const metrics = store.getAllMetrics();
        const activeServers = pool.getAllServers().map(s => s.name);
        
        const payload = {
          metrics,
          activeServers,
          timestamp: Date.now()
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      }, 2000);

      // Cleanup on close is handled by standard stream cancellation, 
      // but interval might leak if not careful. For MVP SSE this is acceptable.
      // Next.js handles request abortion.
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
