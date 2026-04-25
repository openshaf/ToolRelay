import { SchemaAdapter } from "./schema-adapter";
import { OutputValidator } from "./output-validator";
import { SmartRouter } from "./router";
import { pool } from "./mcp-pool";

export class RetryEngine {
  static async executeWithRetry(
    endpointId: string,
    toolName: string,
    args: any,
    expectedSchema: any,
    maxRetries = 2
  ) {
    let attempt = 0;
    let currentArgs = { ...args };
    let lastError: any = null;
    
    // Exclude list to not try the same failing server again
    const triedServers = new Set<string>();

    while (attempt <= maxRetries) {
      attempt++;
      console.log(`[RetryEngine] Attempt ${attempt} for ${toolName}`);

      try {
        // 1. Pick Server (Smart Routing)
        // For MVP, router currently doesn't take an exclude list, but we can iterate.
        // We'll just rely on the router. If it picks the same server and it fails, it's fine.
        const serverName = await SmartRouter.route(toolName, endpointId);
        if (!serverName) {
          throw new Error(`No server available with tool: ${toolName}`);
        }

        // 2. Schema Adaptation
        const adaptedArgs = await SchemaAdapter.adapt(toolName, currentArgs, expectedSchema);
        
        // 3. Execution
        const output = await pool.callTool(serverName, toolName, adaptedArgs);

        // 4. Output Validation
        const validation = await OutputValidator.validate(toolName, adaptedArgs, output);
        
        if (validation.valid) {
          return {
            result: output,
            serverUsed: serverName,
            retries: attempt - 1,
            validation: validation.reason
          };
        } else {
          // LLM said output was invalid/useless. Throw to trigger retry.
          throw new Error(`Output validation failed: ${validation.reason}`);
        }

      } catch (err: any) {
        lastError = err;
        console.error(`[RetryEngine] Error on attempt ${attempt}:`, err.message);
        
        if (attempt <= maxRetries) {
          // Exponential backoff
          await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 500));
        }
      }
    }

    throw new Error(`Tool call failed after ${maxRetries} retries. Last error: ${lastError?.message}`);
  }
}
