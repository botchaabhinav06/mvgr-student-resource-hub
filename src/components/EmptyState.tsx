import React from "react";
import { SearchX, ShieldCheck, FolderPlus, RotateCcw, Plus } from "lucide-react";

interface EmptyStateProps {
  type: "no-materials" | "no-reports" | "no-uploads";
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  switch (type) {
    case "no-materials":
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 cyber-glass border border-dashed rounded-xl max-w-lg mx-auto my-6 box-glow-cyan">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyber-cyan mb-4 animate-pulse">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-100 mb-2">
            No materials found for selected filters.
          </h3>
          <p className="text-sm text-slate-400 mb-6 max-w-sm">
            Try resetting your filters or searches to explore resources uploaded by public moderators or our academic faculty HOD.
          </p>
          {onAction && (
            <button
              onClick={onAction}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500/20 text-cyber-cyan border border-cyan-500/40 text-sm font-medium hover:bg-cyan-500/30 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Active Filter Criteria
            </button>
          )}
        </div>
      );

    case "no-reports":
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 cyber-glass border border-emerald-500/20 rounded-xl max-w-lg mx-auto my-6 box-glow-violet">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-100 mb-2">
            No active reports.
          </h3>
          <p className="text-sm text-slate-400 mb-6 max-w-sm">
            All files are healthy and certified. No discrepancies, poor legibility, or content errors are currently registered in the review pipeline.
          </p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ● System 100% Secure
          </span>
        </div>
      );

    case "no-uploads":
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 cyber-glass border border-dashed border-cyber-violet/40 rounded-xl max-w-lg mx-auto my-6 box-glow-violet">
          <div className="w-16 h-16 rounded-full bg-cyber-violet/10 flex items-center justify-center text-cyber-violet mb-4">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h3 className="font-display font-medium text-xl text-slate-100 mb-2">
            No materials uploaded yet.
          </h3>
          <p className="text-sm text-slate-400 mb-6 max-w-sm">
            Your instructor console repository is currently empty. Get started quickly by sharing academic files, lecture notes, and syllabus sheets.
          </p>
          {onAction && (
            <button
              onClick={onAction}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyber-violet text-white text-sm font-medium hover:bg-cyber-violet/85 shadow-lg shadow-violet-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Upload First Material
            </button>
          )}
        </div>
      );

    default:
      return null;
  }
};
