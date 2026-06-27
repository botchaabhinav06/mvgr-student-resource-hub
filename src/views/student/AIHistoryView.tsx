import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  FileText, 
  GraduationCap, 
  Copy, 
  Check, 
  Calendar, 
  BookOpen, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Filter, 
  Info, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { StudentProfile } from "../../types";
import { auth } from "../../firebase/firebaseConfig";
import { apiUrl } from "../../lib/apiBase";

interface AIHistoryViewProps {
  user: StudentProfile;
}

interface HistoryItem {
  id: string;
  materialId: string;
  materialTitle: string;
  materialType: string;
  subject: string;
  semester: string;
  year: string;
  department: string;
  action: "pdf_summary" | "important_questions";
  actionLabel: string;
  outputPreview: string;
  output: string;
  cached: boolean;
  cacheSource: string;
  modelUsed: string;
  createdAt: string;
  updatedAt: string;
}

export const AIHistoryView: React.FC<AIHistoryViewProps> = ({ user }) => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pdf_summary" | "important_questions">("all");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Fetch AI History from server
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const response = await fetch(apiUrl(`/api/ai/history`), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      if (data.ok) {
        setItems(data.items || []);
      } else {
        throw new Error(data.message || "Failed to parse history database.");
      }
    } catch (err: any) {
      console.error("[AI History Fetch Error]", err);
      setError(err.message || "An unexpected error occurred while loading your history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe markdown formatter
  const renderFormattedMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");

    const parseBoldTags = (lineText: string) => {
      const parts = lineText.split(/\*\*([^*]+)\*\*/g);
      return parts.map((part, i) => 
        i % 2 === 1 ? <strong key={i} className="text-slate-100 font-extrabold">{part}</strong> : part
      );
    };

    return (
      <div className="space-y-3.5 font-sans text-slate-300 text-xs md:text-sm leading-relaxed">
        {lines.map((line, index) => {
          const trimmed = line.trim();

          if (trimmed.startsWith("###")) {
            return (
              <h3 key={index} className="text-xs font-mono font-black text-cyber-cyan border-b border-slate-800 pb-1.5 mt-6 first:mt-0 uppercase tracking-widest">
                {trimmed.replace(/^###\s*/, "")}
              </h3>
            );
          }
          if (trimmed.startsWith("##")) {
            return (
              <h2 key={index} className="text-sm font-bold text-slate-200 mt-6 pb-2 border-b border-slate-850 uppercase tracking-tight">
                {trimmed.replace(/^##\s*/, "")}
              </h2>
            );
          }
          if (trimmed.startsWith("#")) {
            return (
              <h1 key={index} className="text-base font-black text-slate-100 uppercase tracking-wider mb-4">
                {trimmed.replace(/^#\s*/, "")}
              </h1>
            );
          }
          if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
            const content = trimmed.replace(/^[-*]\s*/, "");
            return (
              <div key={index} className="flex items-start gap-2.5 pl-1.5 py-0.5">
                <span className="text-cyber-cyan shrink-0 font-bold select-none mt-1">•</span>
                <span className="flex-1">{parseBoldTags(content)}</span>
              </div>
            );
          }
          if (trimmed.match(/^\d+\./)) {
            const matchPrefix = trimmed.match(/^\d+\./)?.[0] || "";
            const content = trimmed.replace(/^\d+\.\s*/, "");
            return (
              <div key={index} className="flex items-start gap-2.5 pl-1.5 py-0.5">
                <span className="text-cyber-cyan font-mono text-[11px] shrink-0 select-none mt-0.5">{matchPrefix}</span>
                <span className="flex-1">{parseBoldTags(content)}</span>
              </div>
            );
          }
          if (trimmed === "" || trimmed === "---") {
            return trimmed === "---" ? <hr key={index} className="border-slate-800 my-5" /> : null;
          }
          return <p key={index} className="leading-relaxed">{parseBoldTags(trimmed)}</p>;
        })}
      </div>
    );
  };

  const filteredItems = items.filter(item => {
    if (filter === "all") return true;
    return item.action === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
        <div className="academic-bg-glow absolute inset-0 pointer-events-none opacity-40" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyber-cyan" />
            <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest uppercase">
              Academic AI Vault
            </span>
          </div>
          <h1 className="text-2xl font-display font-black tracking-tight text-white uppercase">
            AI Output History
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Revisit previously generated lecture summaries and important practice question matrices.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 bg-slate-950 px-4 py-3 rounded-xl border border-slate-850 self-start md:self-auto shrink-0">
          <Info className="w-4 h-4 text-cyber-cyan shrink-0" />
          <div className="text-[11px]">
            <span className="font-bold text-slate-200 block">Quota-Free Viewing</span>
            <span className="text-slate-400">Viewing saved outputs does not reduce your daily limits.</span>
          </div>
        </div>
      </div>

      {selectedItem ? (
        /* Result Detail View */
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <button
              onClick={() => setSelectedItem(null)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold uppercase text-slate-400 hover:text-white transition-colors border border-slate-800 bg-slate-950/50 hover:bg-slate-950 rounded-lg cursor-pointer w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to History</span>
            </button>

            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-md bg-cyan-500/10 text-cyber-cyan border border-cyan-500/30">
                {selectedItem.actionLabel.toUpperCase()}
              </span>
              <span className="px-2.5 py-1 text-[10px] font-mono font-medium rounded-md bg-slate-950 text-slate-400 border border-slate-850">
                Model: {selectedItem.modelUsed}
              </span>
              <button 
                onClick={() => handleCopyText(selectedItem.output)}
                className="p-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-cyber-cyan transition-colors cursor-pointer"
                title="Copy markdown text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-xs font-mono">
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Document</span>
              <span className="text-slate-200 font-sans font-semibold line-clamp-1" title={selectedItem.materialTitle}>
                {selectedItem.materialTitle}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Course / Dept</span>
              <span className="text-slate-200 font-bold">{selectedItem.department.toUpperCase()}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Year & Sem</span>
              <span className="text-slate-300">Y{selectedItem.year} // S{selectedItem.semester}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Generated On</span>
              <span className="text-slate-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {new Date(selectedItem.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Full Markdown Result Content */}
          <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-850 max-h-[600px] overflow-y-auto custom-scrollbar shadow-inner">
            {renderFormattedMarkdown(selectedItem.output)}

            {/* Disclaimer */}
            <div className="mt-8 pt-4 border-t border-slate-900 flex items-start gap-2.5 text-[10px] text-slate-500 leading-relaxed font-sans">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-slate-600" />
              <p>
                <strong>Academic Disclaimer</strong>: This saved AI response is grounded purely in your original department course materials. Please crosscheck key concepts, terms, and guidelines with your textbook syllabus matrices.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* History Catalog List */
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-wider">
                Filter Vault
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer border ${
                  filter === "all" 
                    ? "bg-cyan-500/10 text-cyber-cyan border-cyan-500/20" 
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                All Outputs ({items.length})
              </button>
              <button
                onClick={() => setFilter("pdf_summary")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer border ${
                  filter === "pdf_summary" 
                    ? "bg-cyan-500/10 text-cyber-cyan border-cyan-500/20" 
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                PDF Summaries ({items.filter(i => i.action === 'pdf_summary').length})
              </button>
              <button
                onClick={() => setFilter("important_questions")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer border ${
                  filter === "important_questions" 
                    ? "bg-cyan-500/10 text-cyber-cyan border-cyan-500/20" 
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                Important Questions ({items.filter(i => i.action === 'important_questions').length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
              <p className="text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse">
                Accessing historical AI logs...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-950/10 border border-red-900/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div>
                <h4 className="text-sm font-black text-red-400 uppercase tracking-wider">Vault Access Failure</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-md">{error}</p>
              </div>
              <button
                onClick={fetchHistory}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 hover:text-white transition-colors"
              >
                Retry Request
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center mx-auto text-slate-500 border border-slate-850">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                  {filter === "all" ? "No AI outputs yet" : "No results found for this filter"}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  {filter === "all" 
                    ? "Generate an academic summary or practice questions for any document inside the AI Assistant, and they will securely appear in your archive here."
                    : "No historical generations match the selected category."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex flex-col bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 p-5 rounded-xl transition-all duration-200"
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-850 pb-3 mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-850 text-cyan-400 shrink-0">
                        {item.action === "pdf_summary" ? (
                          <FileText className="w-4 h-4 text-cyber-cyan" />
                        ) : (
                          <GraduationCap className="w-4 h-4 text-cyber-cyan" />
                        )}
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-mono text-slate-500 font-semibold block uppercase tracking-wider leading-none">
                          {item.actionLabel}
                        </span>
                        <h3 className="text-xs font-bold text-slate-200 line-clamp-1 mt-1 font-sans" title={item.materialTitle}>
                          {item.materialTitle}
                        </h3>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded bg-slate-950 text-slate-400 border border-slate-850 shrink-0">
                      Y{item.year} // S{item.semester}
                    </span>
                  </div>

                  {/* Body Content Preview */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4 text-left flex-1 h-[54px]">
                    {item.outputPreview.replace(/###/g, "").replace(/\*\*/g, "")}
                  </p>

                  {/* Footer Stats / Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-850/60 mt-auto font-mono text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/5 hover:bg-cyan-500/15 text-cyber-cyan border border-cyan-500/10 hover:border-cyan-500/20 text-[10px] font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <span>View Output</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Academic Honesty Rules Info Box */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-left space-y-1">
              <h4 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                Academic Honesty Assurance
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Vault caches are secured with strict access-control policies. Students can only review generated results for active course materials matching their respective academic department catalog.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
