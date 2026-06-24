import React, { useState } from "react";
import { Sparkles, FileText, Tag, AlignLeft, GraduationCap, Brain, Bell, AlertTriangle, Lock, ShieldAlert, BookOpen, Clock } from "lucide-react";
import { FacultyProfile, Material } from "../../types";

interface FacultyAIToolsViewProps {
  user: FacultyProfile;
  materials: Material[];
}

export const FacultyAIToolsView: React.FC<FacultyAIToolsViewProps> = ({ user, materials }) => {
  // Filter materials uploaded by this faculty member
  const facultyMaterials = materials.filter((m) => m.uploadedBy === user.facultyId);

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const selectedMaterial = facultyMaterials.find((m) => m.id === selectedMaterialId);

  const tools = [
    {
      id: "description",
      title: "Generate Material Description",
      description: "Drafts rich, engaging overview descriptions for syllabus topics based on document text, enhancing searchable catalog metadata.",
      icon: AlignLeft,
      badge: "Phase 13.0",
      badgeColor: "bg-cyan-500/10 text-cyber-cyan border-cyan-500/20",
    },
    {
      id: "tags",
      title: "Generate Topic Tags",
      description: "Extracts primary subject concepts, unit highlights, and searchable keywords to structure library organization.",
      icon: Tag,
      badge: "Phase 13.0",
      badgeColor: "bg-cyan-500/10 text-cyber-cyan border-cyan-500/20",
    },
    {
      id: "pre_publish_summary",
      title: "Generate Summary Before Publishing",
      description: "Previews and edits dynamic student-facing summaries before officially finalizing newly uploaded documents.",
      icon: FileText,
      badge: "Phase 13.2",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      id: "questions",
      title: "Generate Important Questions",
      description: "Extracts key technical evaluation points and potential assignment questions from syllabus materials.",
      icon: GraduationCap,
      badge: "Phase 13.2",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      id: "notes",
      title: "Create Short Notes",
      description: "Prepares high-density study revision sheets directly from dense, multi-page PDFs to assist struggling students.",
      icon: Brain,
      badge: "Phase 13.4",
      badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    },
    {
      id: "announcement",
      title: "Announcement Text Helper",
      description: "Drafts concise notice-board and alert text informing students about material updates or upcoming syllabus items.",
      icon: Bell,
      badge: "Phase 13.4",
      badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
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
              Faculty AI Tools Suite
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyber-cyan border border-cyan-500/30 rounded">
              Phase 12.1 - Skeleton
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Draft material descriptions, generate tags, structure important questions, and create summaries seamlessly.
          </p>
        </div>
      </div>

      {/* Safety & Cost Guidelines Panel */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0 border border-amber-500/20 mt-0.5 sm:mt-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Faculty Verification Guard & Data Safety
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
              Material updates generated via AI will reside in the secure global catalog only after official faculty authorization.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 self-stretch sm:self-auto justify-center">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
            Daily Limit: 10 Queries (Staff)
          </span>
        </div>
      </div>

      {/* Selector and Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyber-cyan" />
              <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                01 // Choose Material
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Select one of your uploaded department syllabus files to enable targeted context metadata processing.
            </p>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
                Uploaded By You ({facultyMaterials.length} materials)
              </label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">-- Choose Material --</option>
                {facultyMaterials.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.category.replace("_", " ").toUpperCase()}] {m.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedMaterial ? (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="text-slate-300 font-mono font-medium">{selectedMaterial.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">File size:</span>
                  <span className="text-slate-300 font-mono">{selectedMaterial.fileSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Upload Date:</span>
                  <span className="text-slate-300 font-mono truncate max-w-[120px]">
                    {new Date(selectedMaterial.uploadDate).toLocaleDateString()}
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
        </div>

        {/* Action Grid List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyber-cyan" />
                <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                  02 // Choose Faculty Assistant Tool
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Locked to Next Phase</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <div
                    key={tool.id}
                    className="group relative p-5 rounded-xl border border-slate-800/60 bg-slate-950/40 hover:bg-slate-950/80 hover:border-cyan-500/20 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-cyber-cyan group-hover:border-cyber-cyan/20 transition-all">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded border ${tool.badgeColor}`}>
                          {tool.badge}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-200 group-hover:text-slate-100 transition-colors">
                          {tool.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                          {tool.description}
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
