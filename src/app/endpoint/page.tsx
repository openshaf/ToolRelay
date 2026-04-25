"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Check, Copy, Terminal, Server } from "lucide-react";
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

  if (!id) return <div className="text-center mt-20 text-red-400">No endpoint ID provided.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-12 space-y-8 pb-12">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-green-500/20 text-green-400 rounded-full mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold text-white">Endpoint Ready</h1>
        <p className="text-gray-400 text-lg">Your custom MCP server pool has been provisioned and is ready to use.</p>
      </div>

      <GlassCard className="p-8 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <h2 className="text-lg font-semibold text-white mb-4">Your Connection URL</h2>
        
        <div className="flex items-center bg-black/40 rounded-xl border border-white/10 p-2">
          <code className="flex-1 px-4 py-2 text-primary font-mono text-sm overflow-x-auto whitespace-nowrap">
            {endpointUrl}
          </code>
          <button 
            onClick={copyToClipboard}
            className="ml-2 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-3 mb-4 text-white">
            <Terminal className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Claude Desktop Config</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">Add this to your <code className="text-gray-300">claude_desktop_config.json</code>:</p>
          <pre className="text-xs text-gray-300 bg-black/40 p-4 rounded-xl border border-white/5 overflow-x-auto">
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
          <div className="flex items-center gap-3 mb-4 text-white">
            <Server className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Next Steps</h3>
          </div>
          <ul className="space-y-4 text-sm text-gray-400">
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

          <Link href="/dashboard" className="mt-8 block w-full text-center py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10">
            View Live Dashboard
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}

export default function EndpointPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20 text-gray-400">Loading endpoint details...</div>}>
      <EndpointContent />
    </Suspense>
  );
}
