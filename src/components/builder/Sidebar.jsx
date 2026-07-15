const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";
import { Sparkles, Plus, MessageSquare, User, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ conversations = [], activeId, onNew, onSelect }) {
  const location = useLocation();

  const handleLogout = () => {
    db.auth.logout("/login");
  };

  return (
    <div className="w-[280px] h-screen flex flex-col border-r" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(24px)", borderColor: "rgba(255,255,255,0.6)" }}>
      {/* Logo */}
      <div className="p-5 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <Link to="/" className="text-lg font-bold text-slate-900 no-underline">Alphatekx</Link>
      </div>

      {/* New Chat */}
      <div className="px-3">
        <button onClick={onNew} className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors border-0 cursor-pointer" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Recents */}
      <div className="flex-1 overflow-y-auto mt-4 px-3">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Recents</p>
        {conversations.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left border-0 cursor-pointer mb-0.5 transition-colors ${
              activeId === c.id ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50 bg-transparent"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0 opacity-50" />
            <span className="truncate">{c.title}</span>
          </button>
        ))}
      </div>

      {/* User pill */}
      <div className="p-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl" style={{ background: "rgba(241,245,249,0.7)" }}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700 flex-1">Builder</span>
          <button onClick={handleLogout} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors border-0 bg-transparent cursor-pointer">
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}