import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Brain, 
  FileText, 
  HelpCircle, 
  GraduationCap, 
  FileSearch, 
  MessageSquare, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight, 
  Lock, 
  BookOpen, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Copy,
  Check
} from "lucide-react";
import { StudentProfile, Material } from "../../types";
import { auth } from "../../firebase/firebaseConfig";
import { apiUrl } from "../../lib/apiBase";

interface AIAssistantViewProps {
  user: StudentProfile;
  materials: Material[];
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ user, materials }) => {
  // Filter materials based on student's department and active status
  const filteredMaterials = materials.filter(
    (m) => m.department.toLowerCase() === user.department.toLowerCase() && m.status === "active"
  );

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const selectedMaterial = filteredMaterials.find((m) => m.id === selectedMaterialId);

  // PDF Extraction Quality States
  const [qualityLoading, setQualityLoading] = useState<boolean>(false);
  const [qualityData, setQualityData] = useState<any | null>(null);
  const [qualityError, setQualityError] = useState<string | null>(null);

  // AI Generation States
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<"summary" | "questions" | null>(null);
  const [aiResult, setAiResult] = useState<{
    output: string;
    cached: boolean;
    model?: string;
    pageCount?: number;
    extractedChars?: number;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Fetch quality metrics whenever a student selects a material
  useEffect(() => {
    if (!selectedMaterialId) {
      setQualityData(null);
      setQualityError(null);
      setAiResult(null);
      setAiError(null);
      setActiveAction(null);
      return;
    }

    const fetchPdfQuality = async () => {
      setQualityLoading(true);
      setQualityError(null);
      setQualityData(null);
      setAiResult(null);
      setAiError(null);
      setActiveAction(null);

      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          throw new Error("Authorization credentials missing. Please sign in again.");
        }

        const response = await fetch(apiUrl("/api/ai/material-quality"), {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ materialId: selectedMaterialId })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || `Quality verification failed with status ${response.status}`);
        }

        if (data && data.ok) {
          setQualityData(data.quality);
        } else {
          throw new Error(data?.message || "Failed to retrieve text quality profile.");
        }
      } catch (err: any) {
        console.error("[Quality Retrieval Fail]:", err);
        setQualityError(err.message || "Unable to retrieve PDF text quality statistics.");
      } finally {
        setQualityLoading(false);
      }
    };

    fetchPdfQuality();
  }, [selectedMaterialId]);

  // Execute actual academic AI generation
  const handleTriggerAiAction = async (actionType: "summary" | "questions") => {
    if (!selectedMaterialId) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    setActiveAction(actionType);
    setCopied(false);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Authorization credentials missing. Please sign in again.");
      }

      const endpoint = actionType === "summary" ? "/api/ai/material-summary" : "/api/ai/important-questions";

      const response = await fetch(apiUrl(endpoint), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ materialId: selectedMaterialId })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "PDF_TEXT_NOT_AI_USABLE") {
          // If quality check fails at runtime, sync quality state
          if (data.quality) {
            setQualityData(data.quality);
          }
          throw new Error(data.message || "This material text layer quality is too poor for AI generation.");
        }
        throw new Error(data?.message || `AI extraction failed with status ${response.status}`);
      }

      if (data && data.ok) {
        setAiResult({
          output: data.output,
          cached: !!data.cached,
          model: data.model || "Gemini-3.5-Flash",
          pageCount: data.pageCount,
          extractedChars: data.extractedChars
        });
      } else {
        throw new Error(data?.message || "Academic AI generated an empty response.");
      }
    } catch (err: any) {
      console.error("[AI Generation Error]:", err);
      setAiError(err.message || "An unexpected error occurred during AI content generation.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!aiResult?.output) return;
    navigator.clipboard.writeText(aiResult.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Bespoke helper to parse headers, lists, and bold texts from Markdown safely
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

  const aiFeatures = [
    {
      id: "summary",
      title: "PDF Summary",
      description: "Generates high-yield, structured summaries focusing on Overview, Key Takeaways, Critical Definitions, and Revision Bullet sheets.",
      icon: FileText,
      badge: "Active MVP",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      active: true,
    },
    {
      id: "questions",
      title: "Important Questions Generator",
      description: "Analyzes text and creates curriculum-grounded sample question pools divided into short (2M), medium (5M), and essay-style (10M) practice worksheets.",
      icon: GraduationCap,
      badge: "Active MVP",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      active: true,
    },
    {
      id: "notes",
      title: "Short Notes Generator",
      description: "Transforms dense document PDFs into clean, well-structured, scannable study outlines and lecture highlights.",
      icon: Brain,
      badge: "Phase 13.4",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      active: false,
    },
    {
      id: "terms",
      title: "Key Terms Extractor",
      description: "Identifies and extracts critical academic formulas, equations, definitions, and abbreviations.",
      icon: FileSearch,
      badge: "Phase 13.4",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      active: false,
    },
    {
      id: "chatbot",
      title: "Material Q&A Chatbot",
      description: "Engages in dynamic chat closed-circuit grounded exclusively inside this PDF context to clarify concepts.",
      icon: MessageSquare,
      badge: "Phase 14.0",
      badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      active: false,
    },
    {
      id: "paper_helper",
      title: "Question Paper Helper",
      description: "Provides structured step-by-step solutions and syllabus blueprints for MVGR academic question papers.",
      icon: HelpCircle,
      badge: "Phase 14.0",
      badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      active: false,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-16">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyber-cyan">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100 uppercase tracking-tight">
              Academic AI Assistant
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
              Phase 13.2 MVP Live
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Next-generation academic intelligence grounded strictly in your verified study materials.
          </p>
        </div>
      </div>

      {/* Safety Guard / Cost Control Banner */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-950 rounded-lg text-cyber-cyan shrink-0 border border-slate-800 mt-0.5 sm:mt-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Zero-Trust Secure Processing
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
              Generation operates purely on backend secure proxies. No API credentials or signed download URLs are exposed to your browser session.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 self-stretch sm:self-auto justify-center">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
            Limit: 5 Requests / Day
          </span>
        </div>
      </div>

      {/* UI Work Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Selector & Metadata & Quality Guard */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Section 1: Selector */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyber-cyan" />
              <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                01 // Select Course Material
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Select an approved document from your department catalog to unlock generative summarization.
            </p>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
                My Department catalog: {user.department.toUpperCase()}
              </label>
              <select
                id="material-select"
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">-- Choose Material --</option>
                {filteredMaterials.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.category.replace("_", " ").toUpperCase()}] {m.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedMaterial ? (
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">File Type:</span>
                  <span className="text-slate-300 font-mono font-medium">PDF Document</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">File Size:</span>
                  <span className="text-slate-300 font-mono">{selectedMaterial.fileSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Uploaded Date:</span>
                  <span className="text-slate-300 font-mono">
                    {selectedMaterial.uploadDate ? new Date(selectedMaterial.uploadDate).toLocaleDateString() : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Uploader:</span>
                  <span className="text-slate-300 font-mono truncate max-w-[140px]" title={selectedMaterial.uploadedByName}>
                    {selectedMaterial.uploadedByName}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 border border-dashed border-slate-800 rounded-lg">
                <p className="text-[10px] font-mono text-slate-500 uppercase">
                  No Document Selected
                </p>
              </div>
            )}
          </div>

          {/* Section 2: PDF Extraction Quality Profile */}
          {selectedMaterial && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-cyber-cyan" />
                  <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                    AI Readiness Guard
                  </h3>
                </div>
                {qualityLoading && <Loader2 className="w-3.5 h-3.5 text-cyber-cyan animate-spin" />}
              </div>

              {qualityLoading ? (
                <div className="py-6 flex flex-col items-center justify-center space-y-2">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest animate-pulse">
                    Verifying text layer quality...
                  </p>
                </div>
              ) : qualityError ? (
                <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-200 leading-relaxed">{qualityError}</p>
                </div>
              ) : qualityData ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Status Banner */}
                  <div className={`p-3.5 rounded-lg border flex items-start gap-3 ${
                    qualityData.qualityStatus === 'good' 
                      ? 'bg-emerald-950/15 border-emerald-900/30 text-emerald-300' 
                      : qualityData.qualityStatus === 'weak'
                      ? 'bg-amber-950/15 border-amber-900/30 text-amber-300'
                      : 'bg-red-950/15 border-red-900/30 text-red-300'
                  }`}>
                    {qualityData.qualityStatus === 'good' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : qualityData.qualityStatus === 'weak' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Quality Status: {qualityData.qualityStatus.toUpperCase()}
                      </h4>
                      <p className="text-[10px] opacity-90 mt-1 leading-relaxed">
                        {qualityData.qualityStatus === 'good' && "Text layer is rich and healthy. Highly accurate and contextual generation is guaranteed."}
                        {qualityData.qualityStatus === 'weak' && "Moderate text layer. AI summary can run, but formatting or dense sections may have slight deviations."}
                        {qualityData.qualityStatus === 'poor' && "Low extraction density. Security guard has locked Gemini actions for this file to prevent hallucinations."}
                      </p>
                    </div>
                  </div>

                  {/* Quality Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-2 bg-slate-950 border border-slate-850 rounded">
                      <span className="block text-slate-500 uppercase">Quality Score</span>
                      <span className={`text-xs font-black ${
                        qualityData.qualityScore >= 65 
                          ? 'text-emerald-400' 
                          : qualityData.qualityScore >= 30 
                          ? 'text-amber-400' 
                          : 'text-red-400'
                      }`}>{qualityData.qualityScore}/100</span>
                    </div>
                    <div className="p-2 bg-slate-950 border border-slate-850 rounded">
                      <span className="block text-slate-500 uppercase">Meaningful Chars</span>
                      <span className="text-xs font-bold text-slate-300">{qualityData.meaningfulChars} Chars</span>
                    </div>
                    <div className="p-2 bg-slate-950 border border-slate-850 rounded">
                      <span className="block text-slate-500 uppercase">Total Word Count</span>
                      <span className="text-xs font-bold text-slate-300">{qualityData.wordCount} Words</span>
                    </div>
                    <div className="p-2 bg-slate-950 border border-slate-850 rounded">
                      <span className="block text-slate-500 uppercase">AI Executable</span>
                      <span className={`text-xs font-black uppercase ${qualityData.aiUsable ? 'text-emerald-400' : 'text-red-400'}`}>
                        {qualityData.aiUsable ? "YES // READY" : "NO // BLOCKED"}
                      </span>
                    </div>
                  </div>

                  {/* Warnings Panel */}
                  {qualityData.warnings && qualityData.warnings.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                        Extraction Warnings ({qualityData.warnings.length})
                      </span>
                      <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg space-y-1">
                        {qualityData.warnings.map((warn: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                            <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{warn}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 text-center py-4 italic">
                  Select a document above to run security validation checks.
                </p>
              )}
            </div>
          )}

          {/* Academic Honesty Rules */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                Academic Integrity
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Grounding limits guarantee the generated content strictly answers within syllabus bounds. AI models cannot synthesize or inject unauthorized outside topics.
            </p>
          </div>
        </div>

        {/* Right Column: Intelligent Action Grid / Output Display */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Output Viewer (Displays if an AI result exists or is loading) */}
          {(aiResult || aiLoading || aiError) ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  {activeAction === "summary" ? (
                    <FileText className="w-5 h-5 text-cyber-cyan" />
                  ) : (
                    <GraduationCap className="w-5 h-5 text-cyber-cyan" />
                  )}
                  <div>
                    <h3 className="text-xs font-mono font-extrabold text-slate-200 uppercase tracking-wider">
                      {activeAction === "summary" ? "Academic Material Summary" : "Important Practice Questions"}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate max-w-[200px] md:max-w-[400px]" title={selectedMaterial?.title}>
                      Grounded: {selectedMaterial?.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Cached and Model Badges */}
                  {aiResult && (
                    <>
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded border ${
                        aiResult.cached 
                          ? "bg-cyan-500/10 text-cyber-cyan border-cyan-500/30" 
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {aiResult.cached ? "CACHED: YES" : "GENERATED LIVE"}
                      </span>
                      <span className="hidden md:inline px-2 py-0.5 text-[9px] font-mono font-medium bg-slate-950 text-slate-400 border border-slate-850 rounded">
                        Model: {aiResult.model}
                      </span>
                      <button 
                        onClick={handleCopyText}
                        className="p-1.5 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-cyber-cyan transition-colors"
                        title="Copy text to clipboard"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => {
                      setAiResult(null);
                      setAiError(null);
                      setActiveAction(null);
                    }}
                    className="text-[10px] font-mono text-slate-500 hover:text-slate-300 uppercase tracking-widest ml-1"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Dynamic Loading Overlay */}
              {aiLoading && (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
                  <div className="text-center">
                    <p className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider animate-pulse">
                      Processing Material...
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed max-w-sm">
                      {activeAction === "summary" 
                        ? "Running internal PDF fetching, extracting text chunks, and structuring overview digests..."
                        : "Compiling vocabulary syllabus matrices and synthesizing dual, medium, and exam-focused essay worksheets..."
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Error Output */}
              {aiError && !aiLoading && (
                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-bold uppercase">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Generation Blocked</span>
                  </div>
                  <p className="text-xs text-red-200 leading-relaxed">
                    {aiError}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono uppercase">
                    Ref: academic_ai_security_guard_reject
                  </p>
                </div>
              )}

              {/* Success Result Canvas */}
              {aiResult && !aiLoading && (
                <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-850 max-h-[500px] overflow-y-auto custom-scrollbar shadow-inner animate-in fade-in slide-in-from-bottom-2">
                  {renderFormattedMarkdown(aiResult.output)}

                  {/* AI Disclaimer */}
                  <div className="mt-8 pt-4 border-t border-slate-900 flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed font-sans">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-600" />
                    <p>
                      <strong>Academic Disclaimer</strong>: This AI output was generated strictly using your approved lecture content. AI models can synthesize or format inaccurately; please crosscheck key figures, exam references, and dates against original material.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Core Action Cards Grid */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyber-cyan" />
                <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                  02 // Choose Intelligent Action
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Grounded Helpers</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiFeatures.map((feat) => {
                const IconComponent = feat.icon;
                const isUsable = selectedMaterial && qualityData?.aiUsable && feat.active;
                const showDisabledStatus = selectedMaterial && !qualityData?.aiUsable && feat.active;

                return (
                  <div
                    key={feat.id}
                    className={`group relative p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                      feat.active 
                        ? isUsable
                          ? "border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 hover:border-cyan-500/20 cursor-pointer"
                          : "border-slate-850 bg-slate-950/10 opacity-60"
                        : "border-slate-900 bg-slate-950/5 opacity-40"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg border transition-all ${
                          feat.active && isUsable
                            ? "bg-slate-900 border-slate-800 text-slate-400 group-hover:text-cyber-cyan group-hover:border-cyber-cyan/20"
                            : "bg-slate-950/50 border-slate-900 text-slate-600"
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded border ${feat.badgeColor}`}>
                          {feat.badge}
                        </span>
                      </div>
                      <div>
                        <h4 className={`text-xs font-extrabold transition-colors ${
                          feat.active && isUsable ? "text-slate-200 group-hover:text-slate-100" : "text-slate-500"
                        }`}>
                          {feat.title}
                        </h4>
                        <p className={`text-[11px] leading-relaxed mt-1 ${
                          feat.active && isUsable ? "text-slate-400" : "text-slate-600"
                        }`}>
                          {feat.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Status Panel */}
                    <div className="mt-5 pt-3 border-t border-slate-950 flex items-center justify-between text-[10px] font-mono font-bold uppercase">
                      {!feat.active ? (
                        <>
                          <span className="text-slate-600">Locked to Next Phase</span>
                          <Lock className="w-3.5 h-3.5 text-slate-700" />
                        </>
                      ) : !selectedMaterial ? (
                        <>
                          <span className="text-slate-500">Select Document First</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        </>
                      ) : qualityLoading ? (
                        <>
                          <span className="text-cyan-500/70 animate-pulse">Checking quality...</span>
                          <Loader2 className="w-3.5 h-3.5 text-cyan-600 animate-spin" />
                        </>
                      ) : showDisabledStatus ? (
                        <>
                          <span className="text-red-500/80">Blocked: Poor Quality</span>
                          <XCircle className="w-3.5 h-3.5 text-red-700 shrink-0" />
                        </>
                      ) : (
                        <button
                          id={`btn-generate-${feat.id}`}
                          onClick={() => handleTriggerAiAction(feat.id as "summary" | "questions")}
                          disabled={aiLoading}
                          className="w-full text-left flex items-center justify-between text-cyber-cyan group-hover:text-slate-100 transition-colors"
                        >
                          <span>{aiLoading && activeAction === feat.id ? "Analyzing..." : "Trigger Action"}</span>
                          {aiLoading && activeAction === feat.id ? (
                            <Loader2 className="w-3.5 h-3.5 text-cyber-cyan animate-spin" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-cyber-cyan group-hover:text-slate-100 transition-transform group-hover:translate-x-0.5 duration-200" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
