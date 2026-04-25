import { callOpenRouter } from "./openrouter";

export interface ValidationResult {
  valid: boolean;
  reason: string;
  confidence: number;
}

export class OutputValidator {
  /**
   * Evaluates if the tool's response is actually useful based on the user's intended tool call.
   */
  static async validate(toolName: string, requestedArgs: any, output: any): Promise<ValidationResult> {
    const prompt = `You are the Output Validator for ToolRelay.
Your job is to determine if a tool call produced a valid, useful result, or if it returned a useless error, an empty result when data was expected, or irrelevant information.

Tool Executed: ${toolName}
Arguments Provided:
${JSON.stringify(requestedArgs, null, 2)}

Tool Output:
${JSON.stringify(output, null, 2)}

Evaluate the quality of the Tool Output.
Respond with ONLY valid JSON matching this schema:
{
  "valid": boolean (true if useful, false if an error/empty/useless),
  "reason": "short explanation of why",
  "confidence": number between 0 and 1
}`;

    try {
      const resultText = await callOpenRouter("openai/gpt-oss-20b:free", [{ role: "user", content: prompt }], true);
      const parsed = JSON.parse(resultText);
      return {
        valid: parsed.valid ?? true,
        reason: parsed.reason ?? "LLM returned unexpected format",
        confidence: parsed.confidence ?? 0.5
      };
    } catch (e) {
      console.error("[OutputValidator] Failed to validate, assuming valid by default.", e);
      return { valid: true, reason: "Validation failed", confidence: 0 };
    }
  }
}
