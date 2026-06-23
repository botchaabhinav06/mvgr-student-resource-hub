import React from "react";
import { FolderPlus, Layers, ShieldCheck, Sparkles, Building2, Award, Calendar, ChevronRight } from "lucide-react";
import { FacultyProfile, Material, IssueReport, ActiveScreen } from "../../types";
import { NormalizationReport } from "../../components/NormalizationReport";

interface DashboardViewProps {
  user: FacultyProfile;
  materials: Material[];
  reports: IssueReport[];
  setScreen: (screen: ActiveScreen) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  materials,
  reports,
  setScreen,
}) => {
  // Aggregate stats
  const totalUploaded = materials.filter((m) => m.uploadedBy === user.facultyId).length;
  const totalDownloads = materials.reduce((acc, current) => acc + current.downloadsCount, 0);
  const activeReports = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Banner */}
      <div className="cyber-glass relative p-6 md:p-8 rounded-2xl overflow-hidden shadow-xl border border-slate-700/10 dark:border-cyan-500/30">
        <div className="absolute top-0 right-0 p-8 text-cyan-500/5 dark:text-cyan-500/10 pointer-events-none">
          <Sparkles className="w-48 h-48 animate-pulse duration-[8000ms]" />
        </div>
        <div className="relative z-10 space-y-3.5 font-sans">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-theme-teal-action/10 text-theme-teal-action border border-theme-teal-action/20 shadow-sm">
            <Award className="w-3.5 h-3.5" />
            Faculty Academic Sync Active
          </div>
          <h2 className="font-display font-medium text-2xl md:text-3xl text-slate-100 leading-tight">
            Welcome, <span className="text-theme-teal-action font-bold">{user.facultyName}</span>!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-400 max-w-xl leading-relaxed">
            Manage course materials, review student reports, and keep academic resources updated for your department.
          </p>
          
          <div className="flex flex-wrap gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-200 dark:text-slate-300 bg-theme-teal-action/5 px-3 py-1.5 rounded-full border border-theme-teal-action/25 shadow-sm">
              <Building2 className="w-4 h-4 text-theme-teal-action" />
              <span>Department: <span className="text-theme-teal-action font-bold">{user.department}</span></span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-200 dark:text-slate-300 bg-theme-teal-action/5 px-3 py-1.5 rounded-full border border-theme-teal-action/25 shadow-sm">
              <Award className="w-4 h-4 text-theme-teal-action" />
              <span>Designation: <span className="text-theme-teal-action font-bold">{user.designation}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards aligned with Student telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        
        {/* Metric 1 */}
        <div className="p-5 rounded-xl cyber-glass flex items-center justify-between transition-all hover:translate-y-[-2px] duration-300 shadow-md">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 block font-medium">My Uploaded Documents</span>
            <span className="text-3xl font-display font-bold text-slate-100 block">
              {totalUploaded} <span className="text-xs text-slate-500 uppercase font-semibold">of {materials.length} total</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 block">Contributed materials available in catalog</span>
          </div>
          <div className="p-3 bg-theme-teal-action/10 rounded-xl text-theme-teal-action border border-theme-teal-action/20">
            <Layers className="w-6 h-6 text-theme-teal-action" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl cyber-glass flex items-center justify-between transition-all hover:translate-y-[-2px] duration-300 shadow-md">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 block font-medium">Unresolved Reports Queue</span>
            <span className="text-3xl font-display font-bold text-rose-500 block">{activeReports}</span>
            <span className="text-[10px] font-mono text-slate-500 block">Student issues awaiting audit resolution</span>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Admin administrative tool */}
      {user.role === 'admin' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 px-1">
            <h3 className="font-display font-bold text-base text-slate-100">
              Admin Administrative Tools
            </h3>
          </div>
          <NormalizationReport />
        </div>
      )}

      {/* Quick Launchpad Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display font-bold text-base text-slate-100 flex items-center gap-2">
            <Building2 className="w-4.5 h-4.5 text-theme-teal-action" />
            Quick Launch Actions
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          
          <button
            onClick={() => setScreen("FACULTY_UPLOAD")}
            className="p-5 rounded-xl cyber-glass border border-slate-700/10 dark:border-slate-800 hover:border-theme-teal-action/40 text-left transition-all hover:translate-y-[-2px] duration-300 relative cursor-pointer group shadow-md"
          >
            <div className="p-3 bg-theme-teal-action/10 rounded-xl text-theme-teal-action border border-theme-teal-action/20 w-fit mb-4 group-hover:scale-105 transition-transform">
              <FolderPlus className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-100 mb-1 text-sm flex items-center gap-1 group-hover:text-theme-teal-action transition-colors">
              Upload Material
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload lesson PDFs, slide presentations, syllabus indices, or lecture worksheets.
            </p>
          </button>

          <button
            onClick={() => setScreen("FACULTY_MANAGE")}
            className="p-5 rounded-xl cyber-glass border border-slate-700/10 dark:border-slate-800 hover:border-theme-teal-action/40 text-left transition-all hover:translate-y-[-2px] duration-300 relative cursor-pointer group shadow-md"
          >
            <div className="p-3 bg-theme-teal-action/10 rounded-xl text-theme-teal-action border border-theme-teal-action/20 w-fit mb-4 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-100 mb-1 text-sm flex items-center gap-1 group-hover:text-theme-teal-action transition-colors">
              Manage Materials
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organize, edit titles, update units, retrieve or clear documents in your department.
            </p>
          </button>

          <button
            onClick={() => setScreen("FACULTY_REPORTS")}
            className="p-5 rounded-xl cyber-glass border border-slate-700/10 dark:border-slate-800 hover:border-theme-teal-action/40 text-left transition-all hover:translate-y-[-2px] duration-300 relative cursor-pointer group shadow-md"
          >
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20 w-fit mb-4 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            
            <span className="absolute top-5 right-5 text-[10px] font-mono font-bold bg-rose-500/15 text-rose-450 px-2 py-0.5 rounded-full border border-rose-500/20">
              {activeReports} PENDING
            </span>

            <h4 className="font-semibold text-slate-100 mb-1 text-sm flex items-center gap-1 group-hover:text-rose-450 transition-colors">
              Review Reports
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Investigate Student reported tickets. Coordinate corrections on broken assets.
            </p>
          </button>

        </div>
      </div>
    </div>
  );
};
