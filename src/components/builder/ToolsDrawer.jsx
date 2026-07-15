import React from "react";
import { X, Hammer, PenTool, Code2, ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const tools = [
  { id: "builder", label: "Builder", icon: Hammer, active: true, route: "/builder" },
  { id: "writer", label: "Writer", icon: PenTool, route: null },
  { id: "coder", label: "Coder", icon: Code2, route: null },
  { id: "imagegen", label: "Image Gen", icon: ImageIcon, route: null },
];

export default function ToolsDrawer({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;

  const handleClick = (tool) => {
    if (tool.route) {
      onClose();
      navigate(tool.route);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-0 top-0 h-screen w-72 z-50 p-4" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(24px)" }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Tools</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors border-0 bg-transparent cursor-pointer">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="space-y-1">
          {tools.map(t => (
            <button
              key={t.id}
              onClick={() => handleClick(t)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm border-0 cursor-pointer transition-all ${
                t.active ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-600 hover:bg-slate-50 bg-transparent"
              }`}
            >
              <t.icon className="w-5 h-5" />
              {t.label}
              {t.active && <span className="ml-auto w-2 h-2 rounded-full bg-blue-500" />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}