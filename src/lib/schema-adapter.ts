import { callOpenRouter } from "./openrouter";

export class SchemaAdapter {
  /**
   * Attempts to fix malformed tool arguments based on the expected JSON schema.
   */
  static async adapt(toolName: string, requestedArgs: any, expectedSchema: any): Promise<any> {
    // Basic type coercions (e.g., string "123" to number 123 if schema wants a number)
    const fixedArgs = { ...requestedArgs };
    
    // For MVP, we directly fallback to LLM rewrite if the shape seems significantly off,
    // or just rely on LLM for robust schema adaptation.
    // In a production system, we'd use ajv or zod to check first before calling LLM.
    
    const isLikelyValid = this.basicCheck(fixedArgs, expectedSchema);
    if (isLikelyValid) {
      return fixedArgs;
    }

    console.log(`[SchemaAdapter] Adapting schema for tool ${toolName}...`);
    
    // LLM Fallback to rewrite the request
    const prompt = `You are a schema adapter for a JSON-RPC system.
The tool "${toolName}" expects arguments matching this JSON Schema:
${JSON.stringify(expectedSchema, null, 2)}

The provided arguments are:
${JSON.stringify(requestedArgs, null, 2)}

These arguments are invalid or malformed. Fix them so they perfectly match the schema.
Return ONLY valid JSON matching the schema, with no markdown formatting or explanation.`;

    try {
      const resultText = await callOpenRouter("openai/gpt-oss-20b:free", [{ role: "user", content: prompt }]);
      // Try to parse the result. If it has markdown ticks, strip them.
      let cleanText = resultText.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
      if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
      if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
      
      return JSON.parse(cleanText.trim());
    } catch (e) {
      console.error("[SchemaAdapter] LLM failed to adapt schema, returning original", e);
      return requestedArgs;
    }
  }

  private static basicCheck(args: any, schema: any): boolean {
    // Very naive check for MVP: just check if required keys exist
    if (!schema || !schema.required) return true;
    for (const req of schema.required) {
      if (args[req] === undefined) return false;
    }
    return true;
  }
}
