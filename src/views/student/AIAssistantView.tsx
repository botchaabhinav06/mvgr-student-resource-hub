import React, { useState } from "react";
import { Sparkles, Brain, FileText, HelpCircle, GraduationCap, FileSearch, MessageSquare, AlertTriangle, ShieldCheck, ChevronRight, Lock, BookOpen } from "lucide-react";
import { StudentProfile, Material } from "../../types";

interface AIAssistantViewProps {
  user: StudentProfile;
  materials: Material[];
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ user, materials }) => {
  // Filter materials based on student's department
  const filteredMaterials = materials.filter(
    (m) => m.department.toLowerCase() === user.department.toLowerCase() && m.status === "active"
  );

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const selectedMaterial = filteredMaterials.find((m) => m.id === selectedMaterialId);

  const aiFeatures = [
    {
      id: "summary",
      title: "PDF Summary",
      description: "Generates quick, high-level structural summaries and key takeaway bullet points directly from selected course PDFs.",
      icon: FileText,
      badge: "Phase 13.2",
      badgeColor: "bg-cyan-500/10 text-cyber-cyan border-cyan-500/20",
    },
    {
      id: "questions",
      title: "Important Questions Generator",
      description: "Automatically analyzes textbook content or notes and extracts crucial exam-focused practice question sheets.",
      icon: GraduationCap,
      badge: "Phase 13.2",
      badgeColor: "bg-cyan-500/10 text-cyber-cyan border-cyan-500/20",
    },
    {
      id: "notes",
      title: "Short Notes Generator",
      description: "Transforms bulky textbook chapters and dense documentation PDFs into clean, well-structured, scannable lecture notes.",
      icon: Brain,
      badge: "Phase 13.4",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      id: "terms",
      title: "Key Terms / Definitions Extractor",
      description: "Identifies and extracts critical academic glossary definitions, core equations, and acronyms from materials.",
      icon: FileSearch,
      badge: "Phase 13.4",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      id: "chatbot",
      title: "Material Q&A Chatbot",
      description: "Engages in interactive dialog locked completely inside the selected document context to resolve specific doubts without hallucinations.",
      icon: MessageSquare,
      badge: "Phase 14.0",
      badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    },
    {
      id: "paper_helper",
      title: "Question Paper Helper",
      description: "Provides structured solutions, syllabus references, and grading blueprints for academic question papers.",
      icon: HelpCircle,
      badge: "Phase 14.0",
      badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    },
    {
      id: "mini_chat",
      title: "Mini Study Assistant",
      description: "A secure, rate-limited general academic assistant to help draft study schedules, clarify concepts, and design memory flashcards.",
      icon: Sparkles,
      badge: "Phase 14.1",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyber-cyan">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100 uppercase tracking-tight">
              AI Assistant Workspace
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyber-cyan border border-cyan-500/30 rounded">
              Phase 12.1 - Skeleton
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
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0 border border-amber-500/20 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Security Disclaimer & Architecture Guidelines
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
              All AI services operate through server-side secure proxies. Your institutional identity and files are completely private.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 self-stretch sm:self-auto justify-center">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
            Daily Limit: 5 Requests (Student)
          </span>
        </div>
      </div>

      {/* AI Material Selector Component */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyber-cyan" />
              <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                01 // Select Course Material
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Before choosing an AI function, select a study document from your authorized department catalog.
            </p>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
                Department: {user.department}
              </label>
              <select
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
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">File Name:</span>
                  <span className="text-slate-300 font-mono font-medium truncate max-w-[150px]">
                    {selectedMaterial.fileName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Size:</span>
                  <span className="text-slate-300 font-mono">{selectedMaterial.fileSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Uploaded By:</span>
                  <span className="text-slate-300 font-mono truncate max-w-[120px]">
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

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                Academic Honesty
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This system is an academic assistant designed to enhance comprehension and study planning. Grounding constraints ensure answers are generated strictly using selected syllabus materials.
            </p>
          </div>
        </div>

        {/* AI Action Grid List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyber-cyan" />
                <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                  02 // Choose Intelligent Action
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Locked to Next Phase</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiFeatures.map((feat) => {
                const IconComponent = feat.icon;
                return (
                  <div
                    key={feat.id}
                    className="group relative p-5 rounded-xl border border-slate-800/60 bg-slate-950/40 hover:bg-slate-950/80 hover:border-cyan-500/20 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-cyber-cyan group-hover:border-cyber-cyan/20 transition-all">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded border ${feat.badgeColor}`}>
                          {feat.badge}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-200 group-hover:text-slate-100 transition-colors">
                          {feat.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                          {feat.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500 font-bold uppercase">
                      <span>Action Locked</span>
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
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
