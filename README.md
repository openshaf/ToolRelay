# ToolRelay — MCP Reliability Platform

> Describe what you want to build. We configure your AI tools, route traffic intelligently, and guarantee reliability — all in one endpoint.

---

## What It Does

ToolRelay is a platform that sits between your AI agent and its tools (MCP servers). You describe what you want to build, and ToolRelay:

1. Automatically configures a custom MCP server for you
2. Routes tool calls to the best available server
3. Validates that outputs are actually useful
4. Retries intelligently if something goes wrong
5. Gives you a single endpoint to plug into your agent

---

## The Problem It Solves

When AI agents use tools, three things go wrong constantly:

- **Wrong format** — agent sends a request the tool doesn't understand
- **Tool breaks** — server crashes, times out, or returns an error
- **Useless output** — tool works but returns something irrelevant (asked for a summary, got a file list)

Most systems fail silently. ToolRelay detects, adapts, and recovers.

---

## How It Works

```
User describes what they want
        ↓
Agent configures a custom MCP server
        ↓
Tool call comes in → Router picks best server
        ↓
Schema Adapter fixes request format if needed
        ↓
Tool executes
        ↓
Output Validator checks if result is useful
        ↓
If not → Retry with different server or better prompt
        ↓
Clean result returned to agent
```

---

## Features

**Intent-based setup** — type what you want to build, get a ready-to-use MCP endpoint

**Smart routing** — traffic is distributed across available MCP servers based on live success rates and latency scores

**Schema adapter** — automatically fixes malformed requests before they hit the tool

**Output validation** — uses an LLM to check if the tool's response actually matches what was asked

**Self-healing retries** — up to 3 retries with different servers or improved prompts

**Reliability memory** — tracks which tools work best for which task types over time

**Live dashboard** — see all MCP servers, their health, usage, latency, and success rates in real time

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + Dashboard | React, hosted on Google Cloud Run |
| API Gateway | Google Cloud Functions |
| Intent Agent | Claude API (Sonnet) |
| Output Validator | Claude API (Haiku) |
| Router + Reliability Layer | Python, Google Cloud Functions |
| MCP Server Pool | Google Cloud Run (one container per server type) |
| Metrics + Config Store | Google Cloud Firestore |
| Auth | Firebase Auth |

---

## Your Endpoint

After setup, you get a personal endpoint:

```
https://toolrelay.app/mcp/{your-id}/{server-name}
```

Paste this into your agent. Everything else is handled.

---

## Dashboard

The dashboard shows:

- All MCP servers and their current status (live / degraded / down)
- Per-server success rate, average latency, and total requests
- Live log of recent tool calls with routing decisions
- Which servers are being used for which task types

---

## Project Structure

```
toolrelay/
├── frontend/          # React dashboard + search UI
├── functions/
│   ├── intent-agent/  # Parses user input, configures MCP server
│   ├── router/        # Routes incoming calls to best server
│   ├── adapter/       # Fixes request schema mismatches
│   ├── validator/     # Checks output quality via Claude Haiku
│   └── retry/         # Handles retries and fallback logic
├── servers/           # Cloud Run containers for each MCP server type
└── firestore/         # Schema definitions for metrics and configs
```

---

## Local Setup

```bash
# Clone the repo
git clone https://github.com/your-org/toolrelay
cd toolrelay

# Install frontend dependencies
cd frontend && npm install

# Install function dependencies
cd ../functions && pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Add your Anthropic API key and GCP project ID

# Run locally
npm run dev          # Frontend
functions-framework  # Cloud Functions emulator
```

---

## Environment Variables

```
ANTHROPIC_API_KEY=
GCP_PROJECT_ID=
FIRESTORE_DATABASE=
FIREBASE_AUTH_DOMAIN=
```

---

## Demo Scenario

1. User types: *"Build me a GitHub assistant that summarizes repos"*
2. Intent agent configures a server with GitHub + summarization tools
3. Tool call fires → first server returns a raw file list
4. Validator flags it as not a summary
5. Router switches to backup server
6. Clean summary returned
7. Dashboard updates live with the full decision trail

---

## Built At

[Open Loop] · [25/4/2026] · Team [OpenSHA]
