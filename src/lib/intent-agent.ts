import { callOpenRouter } from "./openrouter";
import { SERVER_REGISTRY } from "./server-registry";

export interface ToolRecommendation {
  serverName: string;
  recommendedTools: string[];
  rationale: string;
}

export async function parseUserIntent(description: string, history: any[] = []): Promise<{ message: string, recommendations?: ToolRecommendation[] }> {
  // We provide the LLM with the registry so it knows what's available
  const availableServers = Object.values(SERVER_REGISTRY).map(s => ({
    name: s.name,
    description: s.description,
    tools: s.tools
  }));

  const systemPrompt = `You are the ToolRelay Intent Agent. Your job is to help users configure an AI agent endpoint with the right Model Context Protocol (MCP) servers.
  
Available MCP Servers:
${JSON.stringify(availableServers, null, 2)}

User Request: "${description}"

Respond in JSON format with two keys:
1. "message": A friendly conversational response to the user.
2. "recommendations": An array of objects, each containing:
   - "serverName": name of the suggested server
   - "recommendedTools": array of tool names from that server
   - "rationale": short explanation of why this is needed for their project

If the user is just saying hello or asking a general question, you can omit the recommendations array.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: description }
  ];

  try {
    const responseText = await callOpenRouter("openai/gpt-oss-120b:free", messages, true);
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error parsing user intent:", error);
    throw new Error("Failed to parse user intent via LLM.");
  }
}
