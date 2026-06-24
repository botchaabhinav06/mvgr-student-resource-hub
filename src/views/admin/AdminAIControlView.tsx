import React from "react";
import { Sparkles, Shield, ToggleLeft, Sliders, Activity, Key, Database, AlertCircle, RefreshCw, Layers } from "lucide-react";

export const AdminAIControlView: React.FC = () => {
  const globalToggles = [
    { id: "summary", name: "PDF Summarizer", active: true, phase: "Phase 13.2" },
    { id: "questions", name: "Important Questions Generator", active: true, phase: "Phase 13.2" },
    { id: "notes", name: "Short Notes Creator", active: false, phase: "Phase 13.4" },
    { id: "terms", name: "Key Terms Extractor", active: false, phase: "Phase 13.4" },
    { id: "chat", name: "Document Context Q&A", active: false, phase: "Phase 14.0" },
    { id: "mini", name: "Mini Study Assistant", active: false, phase: "Phase 14.1" },
  ];

  const limits = [
    { role: "Student Quota", max: "5 Queries / Day", description: "Standard learning access scope" },
    { role: "Faculty Quota", max: "10 Queries / Day", description: "Metadata extraction & summary draft scope" },
    { role: "Admin Quota", max: "20 Queries / Day", description: "System diagnostics scope" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyber-cyan">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100 uppercase tracking-tight">
              AI Command & Controls
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyber-cyan border border-cyan-500/30 rounded">
              Phase 12.1 - Skeleton
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            System administration controls for security parameters, daily role constraints, caching policies, and diagnostic analytics.
          </p>
        </div>
      </div>

      {/* Secrets Reminder Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start gap-4">
        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyber-cyan shrink-0 border border-cyan-500/20">
          <Key className="w-6 h-6" />
        </div>
        <div className="space-y-2 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              Secure Provider Strategy
            </h3>
            <span className="px-2 py-0.5 text-[9px] font-mono font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded">
              Compliant
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
            To strictly ensure security and exclude any exposure vector, all API keys (such as Google Gemini credentials) reside exclusively in production server-side environment variables on our Render container host. The frontend codebase remains entirely decoupled from direct LLM vendor calls.
          </p>
        </div>
      </div>

      {/* Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Toggles and Limits column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Feature Toggles */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <ToggleLeft className="w-4 h-4 text-cyber-cyan" />
              <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                AI Service Controls
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {globalToggles.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-300">{item.name}</span>
                    <p className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                      Target Deployment: {item.phase}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wide font-bold">
                      {item.active ? "Enabled" : "Disabled"}
                    </span>
                    <button
                      disabled
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        item.active ? "bg-cyan-500/40" : "bg-slate-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                          item.active ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Performance & Caching Configuration */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <Database className="w-4 h-4 text-cyber-cyan" />
              <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                Caching & Document Extraction Policies
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] font-sans">
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase font-mono text-[10px] tracking-wider mb-1">
                    Maximum Document Processing Limit
                  </label>
                  <input
                    type="text"
                    disabled
                    value="15 Pages / 150,000 Characters"
                    className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase font-mono text-[10px] tracking-wider mb-1">
                    Cache Strategy (aiOutputs)
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Permanent Document Hash Match (Aggressive)"
                    className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase font-mono text-[10px] tracking-wider mb-1">
                    Primary Provider Config
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Google Gemini Pro Engine (gemini-2.5-flash)"
                    className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase font-mono text-[10px] tracking-wider mb-1">
                    Global On/Off Switch
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Active (Controls Locked Until Implementation)"
                    className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column Limits and Metrics */}
        <div className="space-y-6">
          
          {/* Rate Limits */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyber-cyan" />
              <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                Role Daily Quotas
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Automatic daily user tracking logs are checked via secure database triggers prior to dispatching model queries.
            </p>

            <div className="space-y-3 pt-2">
              {limits.map((l, index) => (
                <div key={index} className="p-3 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-300">{l.role}</span>
                    <p className="text-[10px] text-slate-500">{l.description}</p>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-mono font-bold bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20 rounded">
                    {l.max}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Planned Performance Metrics Monitor */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyber-cyan" />
                <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                  Live Usage Tracker
                </h3>
              </div>
              <span className="text-[9px] font-mono text-slate-500">Planned</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Under development. Analytics widgets will load direct database aggregation counters for token allocation audit trails.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[10px] font-bold">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-center">
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Total Hits</span>
                <span className="text-slate-400 font-extrabold text-xs">--</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-center">
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Errors Logged</span>
                <span className="text-slate-400 font-extrabold text-xs">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
