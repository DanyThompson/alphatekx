import React, { useState } from "react";
import { Monitor, Tablet, Smartphone, Share2, Rocket, Diamond, Code2, ExternalLink, Check } from "lucide-react";
import { getAllTemplates } from "@/lib/generator";

const devices = [
  { id: "desktop", icon: Monitor, width: "100%" },
  { id: "tablet", icon: Tablet, width: 768 },
  { id: "mobile", icon: Smartphone, width: 375 },
];

export default function PreviewPanel({ previewHtml, appName, isBuilding, onSuggestion }) {
  const [device, setDevice] = useState("desktop");
  const [deployed, setDeployed] = useState(false);
  const currentDevice = devices.find(d => d.id === device);
  const suggestions = getAllTemplates();

  const handleDeploy = () => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setDeployed(true);
    setTimeout(() => setDeployed(false), 4000);
  };

  const handleDownloadCode = () => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appName.toLowerCase().replace(/\s/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (!previewHtml) return;
    handleDeploy();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Top bar */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
        {/* Device toggles */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-50">
          {devices.map(d => (
            <button
              key={d.id}
              onClick={() => setDevice(d.id)}
              className={`p-2 rounded-lg transition-all border-0 cursor-pointer ${
                device === d.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600 bg-transparent"
              }`}
            >
              <d.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* URL bar */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-xs text-slate-400 min-w-[260px]">
          <div className={`w-2 h-2 rounded-full ${isBuilding ? "bg-amber-400 animate-pulse" : previewHtml ? "bg-emerald-400" : "bg-slate-300"}`} />
          {appName ? `${appName.toLowerCase().replace(/\s/g, "-")}.alphatekx.app` : "my-app.alphatekx.app"}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {previewHtml && (
            <button onClick={handleDownloadCode} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white cursor-pointer" title="Download source code">
              <Code2 className="w-3.5 h-3.5" />
              Code
            </button>
          )}
          {previewHtml && (
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white cursor-pointer">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          )}
          <button
            onClick={handleDeploy}
            disabled={!previewHtml || isBuilding}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white border-0 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: deployed ? "#10b981" : "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            {deployed ? <Check className="w-3.5 h-3.5" /> : <Rocket className="w-3.5 h-3.5" />}
            {deployed ? "Deployed!" : "Deploy"}
          </button>
        </div>
      </div>

      {/* Deploy notification */}
      {deployed && (
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-sm text-emerald-700">
          <ExternalLink className="w-4 h-4" />
          <span className="font-medium">🚀 {appName} is live!</span> Your app opened in a new tab — fully interactive and shareable.
        </div>
      )}

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center bg-slate-50/50 overflow-hidden">
        {isBuilding ? (
          /* Building animation */
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center animate-pulse" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
              <Diamond className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Building your app...</h3>
            <p className="text-slate-500 text-sm mb-8">AI agents are writing production code</p>
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : previewHtml ? (
          <div className="h-full transition-all duration-300" style={{ width: currentDevice.width === "100%" ? "100%" : currentDevice.width, maxWidth: "100%" }}>
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="App Preview"
            />
          </div>
        ) : (
          /* Empty state */
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
              <Diamond className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Your creation appears here</h3>
            <p className="text-slate-500 text-sm mb-8">Describe your app and watch it build live</p>
            <div className="grid grid-cols-2 gap-3">
              {suggestions.map(s => (
                <button
                  key={s.title}
                  onClick={() => onSuggestion(s.prompt)}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl text-left border-0 cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(241,245,249,0.8)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                    <p className="text-xs text-slate-500">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-6">✨ Or describe your own app idea in the chat</p>
          </div>
        )}
      </div>
    </div>
  );
}