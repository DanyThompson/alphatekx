import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

export default function ChatPanel({ messages, onSend, isBuilding, agentPhase }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isBuilding) return;
    onSend(input.trim());
    setInput("");
  };

  const phases = ["Planner", "Coder", "Verifier"];

  return (
    <div className="w-[380px] h-full flex flex-col border-r" style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(24px)", borderColor: "rgba(255,255,255,0.6)" }}>
      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(241,245,249,0.8)" }}>
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-bold text-slate-900">Builder</h2>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        {/* Agent pipeline */}
        <div className="flex items-center gap-2 mt-3">
          {phases.map((p, i) => {
            const phaseIndex = phases.indexOf(agentPhase);
            const isActive = i <= phaseIndex && isBuilding;
            const isCurrent = p === agentPhase && isBuilding;
            return (
              <React.Fragment key={p}>
                {i > 0 && <div className={`h-px flex-1 ${isActive ? "bg-blue-300" : "bg-slate-200"}`} />}
                <div className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full transition-all ${isCurrent ? "bg-blue-500 animate-pulse" : isActive ? "bg-blue-400" : "bg-slate-300"}`} />
                  <span className={`text-[11px] font-medium ${isActive ? "text-blue-600" : "text-slate-400"}`}>{p}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-slate-900 text-white rounded-[20px] rounded-br-md"
                  : "rounded-[20px] rounded-bl-md"
              }`}
              style={msg.role === "assistant" ? { background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" } : {}}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 px-4 py-3 rounded-[20px]" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Describe what you want to build..."
              className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-700 placeholder:text-slate-400"
              disabled={isBuilding}
            />
            <button type="button" className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors border-0 bg-transparent cursor-pointer">
              <Sparkles className="w-4 h-4 text-blue-500" />
            </button>
            <button type="submit" disabled={isBuilding || !input.trim()} className="p-2 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors border-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}