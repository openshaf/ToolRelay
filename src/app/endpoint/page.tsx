"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Check, Copy, Terminal, Server, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Suspense } from "react";

function EndpointContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [copied, setCopied] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      setEndpointUrl(`${window.location.origin}/api/mcp/${id}`);
    }
  }, [id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!id) return <div className="text-center mt-20 text-[#C23B22] font-[family-name:var(--font-instrument-sans)]">No endpoint ID provided.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-12 space-y-8 pb-12">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-[#2D8A4E]/10 text-[#2D8A4E] rounded-full mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-normal text-[#1A1A1A] font-[family-name:var(--font-instrument-serif)]">
          Endpoint <em>Ready</em>
        </h1>
        <p className="text-text-muted text-lg font-[family-name:var(--font-instrument-sans)]">Your custom MCP server pool has been provisioned and is ready to use.</p>
      </div>

      <GlassCard className="p-8 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <h2 className="text-lg font-normal text-[#1A1A1A] mb-4 font-[family-name:var(--font-instrument-serif)]">Your Connection URL</h2>
        
        <div className="flex items-center bg-surface-warm rounded-xl border border-border-light p-2">
          <code className="flex-1 px-4 py-2 text-primary font-mono text-sm overflow-x-auto whitespace-nowrap">
            {endpointUrl}
          </code>
          <button 
            onClick={copyToClipboard}
            className="ml-2 p-2.5 rounded-lg bg-white hover:bg-primary/5 text-[#1A1A1A] transition-colors flex items-center gap-2 border border-border-light font-[family-name:var(--font-instrument-sans)] text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-[#2D8A4E]" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-3 mb-4 text-[#1A1A1A]">
            <Terminal className="w-5 h-5 text-primary" />
            <h3 className="font-semibold font-[family-name:var(--font-instrument-sans)]">Claude Desktop Config</h3>
          </div>
          <p className="text-sm text-text-muted mb-4 font-[family-name:var(--font-instrument-sans)]">Add this to your <code className="text-text-secondary bg-surface-warm px-1.5 py-0.5 rounded">claude_desktop_config.json</code>:</p>
          <pre className="text-xs text-text-secondary bg-surface-warm p-4 rounded-xl border border-border-light overflow-x-auto font-mono">
{`"mcpServers": {
  "toolrelay-${id.split('-')[0]}": {
    "command": "curl",
    "args": [
      "-X", "POST",
      "-H", "Content-Type: application/json",
      "-d", "@-",
      "${endpointUrl}"
    ]
  }
}`}
          </pre>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-4 text-[#1A1A1A]">
            <Server className="w-5 h-5 text-primary" />
            <h3 className="font-semibold font-[family-name:var(--font-instrument-sans)]">Next Steps</h3>
          </div>
          <ul className="space-y-4 text-sm text-text-muted font-[family-name:var(--font-instrument-sans)]">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              Plug the endpoint into your AI agent or IDE (Cursor, Claude, etc).
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              Make tool calls as normal. ToolRelay will route, validate, and retry automatically.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              Monitor live traffic and reliability scores.
            </li>
          </ul>

          <Link href="/dashboard" className="mt-8 block w-full text-center py-3 rounded-xl bg-primary/5 hover:bg-primary/10 text-[#1A1A1A] transition-colors border border-primary/20 font-[family-name:var(--font-instrument-sans)] font-semibold flex items-center justify-center gap-2">
            View Live Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}

export default function EndpointPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20 text-text-muted font-[family-name:var(--font-instrument-sans)]">Loading endpoint details...</div>}>
      <EndpointContent />
    </Suspense>
  );
}
