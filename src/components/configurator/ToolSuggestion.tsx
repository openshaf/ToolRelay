import { ToolRecommendation } from "@/lib/intent-agent";
import { Server, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolSuggestionProps {
  suggestion: ToolRecommendation;
  selected: boolean;
  onToggle: () => void;
}

export function ToolSuggestion({ suggestion, selected, onToggle }: ToolSuggestionProps) {
  return (
    <div 
      onClick={onToggle}
      className={cn(
        "bg-white/80 backdrop-blur-sm rounded-xl p-4 my-2 cursor-pointer transition-all duration-300 border-2",
        selected ? "border-primary/50 bg-primary/5" : "border-transparent hover:border-border"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", selected ? "bg-primary/15 text-primary" : "bg-surface-warm text-text-muted")}>
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-[#1A1A1A] capitalize font-[family-name:var(--font-instrument-sans)]">{suggestion.serverName}</h4>
            <p className="text-sm text-text-muted mt-1 font-[family-name:var(--font-instrument-sans)]">{suggestion.rationale}</p>
          </div>
        </div>
        <div className={cn("rounded-full p-1", selected ? "text-primary" : "text-border")}>
          <CheckCircle className="w-6 h-6" />
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestion.recommendedTools.map(t => (
          <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-surface-warm text-text-secondary border border-border-light font-[family-name:var(--font-instrument-sans)]">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
