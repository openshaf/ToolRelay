"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Rocket } from "lucide-react";
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
    <div className="flex flex-col w-full max-w-4xl mx-auto h-[80vh]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
            <Rocket className="w-16 h-16 mb-4 text-primary" />
            <h2 className="text-2xl font-bold text-white">What are you building?</h2>
            <p className="max-w-md">Describe your AI agent's purpose, and we'll configure the perfect set of MCP servers for it.</p>
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
                  : "glass-card mr-12 text-gray-200"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <p className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Suggested Tools</p>
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
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              Thinking...
            </div>
          </motion.div>
        )}

        {messages.length > 0 && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-8 pb-4">
            <button 
              onClick={handleCreateEndpoint}
              disabled={selectedServers.size === 0 || creatingEndpoint}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {creatingEndpoint ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
              {creatingEndpoint ? "Deploying Servers..." : "Create Endpoint"}
            </button>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 relative">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-[#111827] rounded-full px-6 py-4 border border-white/10 shadow-2xl">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g. A GitHub assistant that reads issues and writes code..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="ml-4 p-2 rounded-full text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:bg-gray-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
