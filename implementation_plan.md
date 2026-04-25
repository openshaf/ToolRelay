# ToolRelay — MCP Reliability Platform

Build a full-stack platform that lets users describe what they want to build, auto-configures the right MCP servers, routes tool calls intelligently with schema sanitization and output validation, and exposes a single reliable endpoint.

**Stack:** Next.js 15 (App Router) + Tailwind CSS + TypeScript + `@modelcontextprotocol/sdk`

---

## User Review Required

> [!IMPORTANT]
> **OpenRouter API Key** — The intent agent and output validator use OpenRouter free models (`openai/gpt-oss-120b:free` for intent, `openai/gpt-oss-20b:free` for validation). You'll need to provide your `OPENROUTER_API_KEY` in `.env.local`.

> [!WARNING]
> **Local-only MCP servers** — For the hackathon MVP, we'll bundle 6 pre-built MCP server definitions (Filesystem, GitHub, Brave Search, Puppeteer, Memory, SQLite). These will run as local subprocesses via `stdio` transport. The architecture is designed so each can be swapped for a Cloud Run container later.

> [!IMPORTANT]
> **No Firebase/Firestore for now** — Since everything is local-first, we'll use an in-memory store (with JSON file persistence) for metrics, configs, and reliability memory. This maps cleanly to Firestore later.

---

## Open Questions

1. **Auth** — Do you want user authentication (Firebase Auth) in this MVP, or is it single-user/local-only for now?
2. **Which MCP servers to actually spawn?** — I plan to include these 6 as the available pool: `filesystem`, `github`, `brave-search`, `puppeteer`, `memory`, `sqlite`. Want to add/remove any?
3. **OpenRouter model names** — The README says `openai/gpt-oss-120b:free` and `openai/gpt-oss-20b:free`. Should I use these exact model IDs, or do you have preferred alternatives?

---

## Proposed Changes

The project will be a single Next.js monorepo with the following structure:

```
toolrelay/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── page.tsx                # Landing → Configurator chat UI
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Live dashboard
│   │   ├── endpoint/
│   │   │   └── page.tsx            # Endpoint display + config page
│   │   └── layout.tsx              # Root layout with nav
│   │
│   ├── components/
│   │   ├── configurator/
│   │   │   ├── ChatInterface.tsx   # ChatGPT-like search/chat UI
│   │   │   ├── MessageBubble.tsx   # Individual message component
│   │   │   ├── ToolSuggestion.tsx  # Suggested MCP tools card
│   │   │   └── ConfigSummary.tsx   # Final config review before creation
│   │   ├── dashboard/
│   │   │   ├── ServerCard.tsx      # Per-server health card
│   │   │   ├── MetricsChart.tsx    # Latency/success charts
│   │   │   ├── CallLog.tsx         # Live call log table
│   │   │   └── StatusBadge.tsx     # Live/Degraded/Down indicator
│   │   └── ui/
│   │       ├── GlassCard.tsx       # Glassmorphism card component
│   │       ├── AnimatedInput.tsx   # Animated search bar
│   │       └── Navbar.tsx          # Top navigation
│   │
│   ├── lib/
│   │   ├── openrouter.ts           # OpenRouter API client
│   │   ├── intent-agent.ts         # Parses user input → tool config
│   │   ├── router.ts               # Smart routing logic
│   │   ├── schema-adapter.ts       # Input sanitization / schema fixing
│   │   ├── output-validator.ts     # LLM-based output quality check
│   │   ├── retry-engine.ts         # Self-healing retry logic
│   │   ├── reliability-store.ts    # In-memory metrics + JSON persistence
│   │   ├── mcp-pool.ts             # MCP server process manager
│   │   └── server-registry.ts      # Available server definitions
│   │
│   ├── api/                        # Next.js API routes
│   │   ├── configure/route.ts      # POST — chat with intent agent
│   │   ├── create-endpoint/route.ts# POST — finalize config, spawn servers
│   │   ├── mcp/[id]/route.ts       # POST — unified MCP proxy endpoint
│   │   ├── servers/route.ts        # GET — list servers + health
│   │   └── metrics/route.ts        # GET — SSE stream for live metrics
│   │
│   └── types/
│       ├── mcp.ts                  # MCP-related type definitions
│       └── config.ts               # Configuration types
│
├── data/                           # Persisted JSON stores
│   ├── configs/                    # User endpoint configs
│   └── metrics/                    # Reliability memory data
│
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── .env.local
```

---

### 1. Configurator Chat UI (Frontend)

The landing page is a **full-screen, ChatGPT-style conversational interface** with a centered animated search bar.

#### [NEW] [page.tsx](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/app/page.tsx)
- Full-viewport dark gradient background with subtle grid pattern
- Centered hero: "What are you building?" with animated glow input
- On submit, transitions into a chat view with the intent agent
- Agent responds with suggested MCP tools (interactive cards)
- User can accept/reject/modify suggestions
- Final step: "Create Endpoint" button → generates the config

#### [NEW] [ChatInterface.tsx](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/components/configurator/ChatInterface.tsx)
- Message list with auto-scroll, typing indicators
- Tool suggestion cards rendered inline in the chat
- Glassmorphism card style with neon accent borders

#### [NEW] [ToolSuggestion.tsx](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/components/configurator/ToolSuggestion.tsx)
- Displays each suggested MCP tool with icon, name, description
- Toggle to include/exclude
- Shows which specific functions from the tool are recommended

---

### 2. Intent Agent (Backend)

#### [NEW] [intent-agent.ts](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/lib/intent-agent.ts)
- Uses OpenRouter (`openai/gpt-oss-120b:free`) to parse user intent
- System prompt instructs the model to:
  1. Understand what the user wants to build
  2. Map to available MCP server capabilities
  3. Return structured JSON with recommended tools and functions
- Maintains chat history for multi-turn conversation
- Returns structured `ToolRecommendation[]` with server name, specific tools, and rationale

#### [NEW] [configure/route.ts](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/app/api/configure/route.ts)
- Accepts `{ messages: ChatMessage[] }` 
- Calls intent agent, returns agent response + tool suggestions
- Streams response for real-time feel

---

### 3. MCP Server Pool Manager

#### [NEW] [mcp-pool.ts](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/lib/mcp-pool.ts)
- Manages child processes for each active MCP server
- Uses `@modelcontextprotocol/sdk` client to communicate via `stdio`
- Spawns servers on-demand when an endpoint is created
- Health checking via periodic `ping` / `list_tools`
- Tracks per-server: status (live/degraded/down), latency, success rate

#### [NEW] [server-registry.ts](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/lib/server-registry.ts)
- Static registry of available MCP servers:
  - **filesystem**: `npx -y @modelcontextprotocol/server-filesystem <path>`
  - **github**: `npx -y @modelcontextprotocol/server-github`
  - **brave-search**: `npx -y @modelcontextprotocol/server-brave-search`
  - **puppeteer**: `npx -y @modelcontextprotocol/server-puppeteer`
  - **memory**: `npx -y @modelcontextprotocol/server-memory`
  - **sqlite**: `npx -y @modelcontextprotocol/server-sqlite`
- Each entry has: name, command, args, env requirements, available tools list, description

---

### 4. Schema Adapter (Input Sanitization)

This is a **core differentiator** — fixing malformed requests before they hit the tool.

#### [NEW] [schema-adapter.ts](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/lib/schema-adapter.ts)
- Fetches the target tool's input schema (JSON Schema from MCP `tools/list`)
- Validates incoming request against the schema using `zod` or `ajv`
- If validation fails:
  1. **Auto-coerce** — type mismatches (string→number, missing defaults)
  2. **Rename fields** — fuzzy match field names (e.g., `fileName` → `file_name`)
  3. **Strip extras** — remove unknown fields
  4. **LLM fallback** — if auto-fix fails, use the output validator model to rewrite the request
- Logs all adaptations for the dashboard

---

### 5. Output Validator

#### [NEW] [output-validator.ts](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/lib/output-validator.ts)
- After a tool executes, validates the output quality
- Uses OpenRouter (`openai/gpt-oss-20b:free`) with a structured prompt:
  - "The user asked for X. The tool returned Y. Is Y a valid, useful response?"
  - Returns `{ valid: boolean, reason: string, confidence: number }`
- If invalid → triggers retry engine
- Tracks validation history per tool for reliability memory

---

### 6. Smart Router

#### [NEW] [router.ts](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/lib/router.ts)
- When a tool call comes in:
  1. Look up all servers that provide the requested tool
  2. Score each by: `success_rate * 0.6 + (1/latency) * 0.3 + recency * 0.1`
  3. Pick the highest-scoring server
  4. If primary fails, fall back to next-best
- Scores are pulled from the reliability store
- Weighted random selection with bias toward best performers (avoids cold-start starvation)

---

### 7. Retry Engine

#### [NEW] [retry-engine.ts](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/lib/retry-engine.ts)
- Up to 3 retries per call
- Retry strategies:
  1. **Same server, fixed input** — schema adapter re-processes the request
  2. **Different server** — router picks next-best
  3. **LLM-enhanced prompt** — validator suggests improved input
- Exponential backoff between retries
- Full retry trail logged for dashboard visibility

---

### 8. Reliability Store

#### [NEW] [reliability-store.ts](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/lib/reliability-store.ts)
- In-memory store with periodic JSON file flush
- Tracks per-server, per-tool:
  - Total calls, successes, failures
  - Average latency (rolling window)
  - Last 50 call results
  - Success rate trend (improving/degrading)
- Tracks per-endpoint configs
- Provides getter APIs for router scoring and dashboard display

---

### 9. Unified MCP Proxy Endpoint

#### [NEW] [mcp/[id]/route.ts](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/app/api/mcp/[id]/route.ts)
- The single endpoint users plug into their agents
- Accepts standard MCP JSON-RPC requests
- Pipeline: **Request → Schema Adapter → Router → Execute → Output Validator → (Retry?) → Response**
- Returns clean MCP-compliant responses
- Every call is logged to the reliability store

#### [NEW] [create-endpoint/route.ts](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/app/api/create-endpoint/route.ts)
- Accepts the finalized tool config from the configurator
- Generates a unique endpoint ID
- Spawns necessary MCP server processes
- Returns the endpoint URL: `http://localhost:3000/api/mcp/{id}`

---

### 10. Live Dashboard

#### [NEW] [dashboard/page.tsx](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/app/dashboard/page.tsx)
- Dark theme with glassmorphism cards
- **Server Grid**: Cards for each active MCP server showing status badge, success rate donut, latency sparkline, total calls
- **Call Log**: Real-time scrolling table of recent tool calls with: timestamp, tool name, routing decision, latency, validation result, retry count
- **Metrics Overview**: Aggregate stats — total calls, avg latency, overall success rate, active servers
- SSE-powered live updates (no polling)

#### [NEW] [metrics/route.ts](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/app/api/metrics/route.ts)
- Server-Sent Events endpoint streaming live metrics
- Pushes updates on every tool call completion

---

### 11. Endpoint Display Page

#### [NEW] [endpoint/page.tsx](file:///d:/Technical/Hackathon%20Projects/ToolRelay/src/app/endpoint/page.tsx)
- Shows the generated endpoint URL with a copy button
- Configuration summary: which tools are active, which servers are running
- Quick-start code snippets for connecting from Claude Desktop, Cursor, etc.
- Link to dashboard

---

## Design System

- **Theme**: Dark mode with deep navy/charcoal backgrounds (`#0a0a1a`, `#111827`)
- **Accents**: Electric blue (`#3b82f6`) + cyan (`#06b6d4`) gradient for primary actions
- **Cards**: Glassmorphism — `backdrop-blur-xl bg-white/5 border border-white/10`
- **Typography**: `Inter` from Google Fonts
- **Animations**: Framer Motion for page transitions, typing indicators, card entrances
- **Glow effects**: Box shadows with accent color on focus/hover

---

## Verification Plan

### Automated Tests
1. `npm run build` — verify the full project compiles
2. `npm run dev` — verify dev server starts and pages render
3. Manual browser test: navigate configurator flow end-to-end
4. Verify API routes respond correctly with `curl` tests

### Manual Verification
1. Type a project description → verify intent agent returns relevant tool suggestions
2. Create an endpoint → verify MCP servers spawn
3. Send a tool call to the proxy endpoint → verify routing, schema adaptation, output validation
4. Check dashboard → verify live metrics update
5. Test retry: send a deliberately bad request → verify retry engine kicks in
