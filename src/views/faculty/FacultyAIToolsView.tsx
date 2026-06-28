import React from "react";
import { Sparkles, Lock, ShieldAlert } from "lucide-react";
import { FacultyProfile, Material } from "../../types";

interface FacultyAIToolsViewProps {
  user: FacultyProfile;
  materials: Material[];
}

export const FacultyAIToolsView: React.FC<FacultyAIToolsViewProps> = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-xl">
        {/* Visual Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyber-cyan">
          <Lock className="w-8 h-8" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-cyber-cyan" />
            <span className="text-[10px] font-mono font-bold text-cyber-cyan uppercase tracking-widest">
              AI Tools Suite
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-100 uppercase tracking-tight">
            Not Enabled in Release Scope
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Faculty AI generation tools are not active in the current production release. Academic AI capabilities are currently dedicated to student resource digestion and summary worksheets.
          </p>
        </div>

        {/* Diagnostic Panel */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-start gap-3 text-left">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-[10px] font-mono font-extrabold text-slate-300 uppercase tracking-wider">
              Access Restriction Guard
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              This module is dormant. No prompt models, API calls, or database listeners are initialized for staff accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
