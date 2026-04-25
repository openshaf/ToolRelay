"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Rocket, X } from "lucide-react";
import { ToolRecommendation } from "@/lib/intent-agent";
import { ToolSuggestion } from "./ToolSuggestion";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  recommendations?: ToolRecommendation[];
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedServers, setSelectedServers] = useState<Set<string>>(new Set());
  const [creatingEndpoint, setCreatingEndpoint] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.message,
        recommendations: data.recommendations
      }]);

      if (data.recommendations) {
        const newServers = new Set(selectedServers);
        data.recommendations.forEach((r: ToolRecommendation) => newServers.add(r.serverName));
        setSelectedServers(newServers);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I ran into an error processing that." }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleServer = (name: string) => {
    setSelectedServers(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleCreateEndpoint = async () => {
    if (selectedServers.size === 0) return;
    setCreatingEndpoint(true);
    try {
      const res = await fetch("/api/create-endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "My Project Agent",
          description: "Configured via ToolRelay",
          servers: Array.from(selectedServers)
        })
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/endpoint?id=${data.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingEndpoint(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto h-[80vh]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            {/* Badge sticker */}
            <span className="badge-sticker text-base">
              Configure
            </span>

            {/* Editorial serif heading */}
            <h1 className="text-4xl sm:text-5xl font-normal leading-tight text-[#1A1A1A] font-[family-name:var(--font-instrument-serif)]">
              What are you <em>building</em>?
            </h1>
            <p className="max-w-md text-text-muted text-lg font-[family-name:var(--font-instrument-sans)]">
              Describe your AI agent&apos;s purpose, and we&apos;ll configure the perfect set of MCP servers for it.
            </p>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === "user" 
                  ? "bg-primary text-white ml-12" 
                  : "warm-card mr-12 text-[#3A3A3A]"
              }`}>
                <p className="whitespace-pre-wrap font-[family-name:var(--font-instrument-sans)]">{msg.content}</p>
                
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <p className="text-sm font-bold text-text-muted mb-3 uppercase tracking-[0.15em] font-[family-name:var(--font-instrument-sans)]">Suggested Tools</p>
                    {msg.recommendations.map(rec => (
                      <ToolSuggestion 
                        key={rec.serverName}
                        suggestion={rec}
                        selected={selectedServers.has(rec.serverName)}
                        onToggle={() => toggleServer(rec.serverName)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="warm-card p-4 rounded-2xl flex items-center gap-3 text-text-muted">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="font-[family-name:var(--font-instrument-sans)]">Thinking...</span>
            </div>
          </motion.div>
        )}

        {messages.length > 0 && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-8 pb-4">
            <button 
              onClick={handleCreateEndpoint}
              disabled={selectedServers.size === 0 || creatingEndpoint}
              className="px-8 py-3.5 rounded-lg bg-primary text-white font-bold shadow-md hover:shadow-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-[family-name:var(--font-instrument-sans)] uppercase tracking-wider text-sm"
            >
              {creatingEndpoint ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
              {creatingEndpoint ? "Deploying Servers..." : "Create Endpoint"}
            </button>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area — warm, minimal, editorial */}
      <div className="p-4 relative">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="relative flex items-center bg-white rounded-lg px-5 py-4 border border-border shadow-sm transition-shadow focus-within:shadow-md focus-within:border-primary/40">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g. A GitHub assistant that reads issues and writes code..."
              className="flex-1 bg-transparent border-none outline-none text-[#1A1A1A] placeholder-[#C8C4BC] font-[family-name:var(--font-instrument-sans)] text-base"
              disabled={loading}
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                className="mr-3 p-1 text-text-muted hover:text-[#1A1A1A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-lg text-white bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:bg-[#C8C4BC] transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
