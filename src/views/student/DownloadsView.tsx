import React from "react";
import { Download, Sparkles, AlertCircle, FileText, ArrowRight, Eye, RefreshCw, Trash2 } from "lucide-react";
import { Material } from "../../types";

interface DownloadsViewProps {
  downloadedMaterials: Material[];
  triggerPreview: (material: Material) => void;
  onClearDownloads: () => void;
  setScreen: (screen: "STUDENT_BROWSE" | "STUDENT_DASHBOARD") => void;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  downloadedMaterials,
  triggerPreview,
  onClearDownloads,
  setScreen,
}) => {
  return (
    <div className="space-y-6">
      {/* Informative Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/20 via-slate-900 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            MY RECENT DOWNLOADS
          </div>
          <h2 className="font-display font-bold text-xl text-slate-100 uppercase tracking-tight">
            My Downloads Journal
          </h2>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            View resources downloaded during your current session for easy re-access.
          </p>
        </div>

        {downloadedMaterials.length > 0 && (
          <button
            onClick={onClearDownloads}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-200 text-xs font-semibold cursor-pointer transition"
          >
            <Trash2 className="w-4 h-4" />
            Clear Current Logs
          </button>
        )}
      </div>

      {downloadedMaterials.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800">
            <span>DOWNLOAD HISTORY ({downloadedMaterials.length} ENTRIES LISTED)</span>
            <span>CURRENT SESSION ONLY</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {downloadedMaterials.map((mat, index) => (
              <div
                key={`${mat.id}-${index}`}
                className="p-4 rounded-xl cyber-glass border border-slate-800 flex items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                      {mat.category}
                    </span>
                    <h4 className="font-medium text-slate-200 truncate pr-4 text-sm mt-1">
                      {mat.title}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-500 mt-1">
                      DEP: {mat.department} // YEAR: {mat.year} S{mat.semester} // Size: {mat.fileSize}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => triggerPreview(mat)}
                    className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition"
                    title="Quick Re-Access Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => triggerPreview(mat)} // Simulated PDF viewer triggers same experience
                    className="p-2 rounded-lg bg-cyan-500/20 text-cyber-cyan hover:bg-cyan-500/30 border border-cyan-500/25 transition"
                    title="Reload Document Link"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-slate-800 rounded-2xl max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="font-display font-medium text-lg text-slate-200 mb-1">
            No previously downloaded materials.
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">
            You have not downloaded any textbook materials in this session yet.
          </p>
          <button
            onClick={() => setScreen("STUDENT_BROWSE")}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 active:scale-95 transition"
          >
            Launch Browse Catalog
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
