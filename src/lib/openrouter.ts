export async function callOpenRouter(
  model: string,
  messages: { role: string; content: string }[],
  jsonMode: boolean = false
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not defined in environment variables.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "ToolRelay",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: jsonMode ? { type: "json_object" } : undefined
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
