import React from "react";
import { FolderPlus, Layers, ShieldCheck, Mail, Users, FileBarChart, Sparkles, Building2, Database } from "lucide-react";
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
      {/* Dynamic Cyber Welcome Greeting Page */}
      <div className="relative p-6 md:p-8 rounded-2xl cyber-glass border border-slate-700/15 dark:border-slate-800 dark:bg-slate-900/40 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-theme-teal-action/5 dark:text-cyber-violet/10 pointer-events-none">
          <Sparkles className="w-48 h-48 animate-pulse" />
        </div>
        <div className="relative z-10 space-y-3 font-sans">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-theme-teal-action/10 dark:bg-cyber-violet/10 text-theme-teal-action dark:text-cyber-violet border border-theme-teal-action/15 dark:border-cyber-violet/20">
            <Building2 className="w-3.5 h-3.5" />
            Faculty Workspace Active
          </div>
          <h2 className="font-display font-medium text-2xl md:text-3xl text-slate-100 leading-tight">
            Welcome, <span className="text-theme-teal-action dark:text-cyber-violet font-bold">{user.facultyName}</span>!
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-400 max-w-xl leading-relaxed">
            Manage course materials, review student reports, and keep academic resources updated for your department.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 font-mono">
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-300 bg-slate-900/5 dark:bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-700/10 dark:border-slate-800 shadow-sm">
              DESIGNATION: <span className="text-theme-teal-action dark:text-cyber-violet font-bold">{user.designation}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-300 bg-slate-900/5 dark:bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-700/10 dark:border-slate-800 shadow-sm">
              DEPARTMENT: <span className="text-theme-teal-action dark:text-cyber-violet font-bold">{user.department}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Metric Codes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        <div className="p-5 rounded-xl cyber-glass border border-slate-700/10 dark:border-slate-800 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 block">MY UPLOADED INVENTORY</span>
            <span className="text-3xl font-display font-bold text-slate-100 block">{totalUploaded} / {materials.length}</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-500 block">Total materials: {materials.length}</span>
          </div>
          <div className="p-3 bg-theme-teal-action/10 dark:bg-violet-500/10 rounded-xl text-theme-teal-action dark:text-cyber-violet border border-theme-teal-action/15 dark:border-violet-500/10 shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl cyber-glass border border-slate-700/10 dark:border-slate-800 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 block">Unresolved Reports Status</span>
            <span className="text-3xl font-display font-bold text-rose-600 dark:text-rose-400 block">{activeReports}</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-500 block">Requiring immediate audit action</span>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-500/25 dark:border-rose-500/15 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {user.role === 'admin' && (
        <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-100 dark:text-slate-200">
                Admin Administrative Tools
            </h3>
            <NormalizationReport />
        </div>
      )}

      {/* Main launch pads dashboard shortcuts */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-100 dark:text-slate-200">
          Faculty Quick Launch Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setScreen("FACULTY_UPLOAD")}
            className="p-5 rounded-xl cyber-glass border border-slate-700/11 dark:border-slate-800 hover:border-theme-teal-action/40 dark:hover:border-violet-500/30 text-left transition duration-150 relative cursor-pointer group shadow-sm hover:shadow-md"
          >
            <FolderPlus className="w-6 h-6 text-theme-teal-action dark:text-cyber-violet mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-slate-100 mb-1 text-sm">Upload Material</h4>
            <p className="text-xs text-slate-400">Upload lesson PDFs, slides PDFs, syllabus copies, lab manuals, and notes for students.</p>
          </button>

          <button
            onClick={() => setScreen("FACULTY_MANAGE")}
            className="p-5 rounded-xl cyber-glass border border-slate-700/11 dark:border-slate-800 hover:border-theme-teal-action/40 dark:hover:border-violet-500/30 text-left transition duration-150 relative cursor-pointer group shadow-sm hover:shadow-md"
          >
            <Layers className="w-6 h-6 text-theme-teal-action dark:text-cyber-violet mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-slate-100 mb-1 text-sm">Manage Materials</h4>
            <p className="text-xs text-slate-400">Review, edit, and organize uploaded academic resources.</p>
          </button>

          <button
            onClick={() => setScreen("FACULTY_REPORTS")}
            className="p-5 rounded-xl cyber-glass border border-slate-700/11 dark:border-slate-800 hover:border-theme-teal-action/40 dark:hover:border-violet-500/30 text-left transition duration-150 relative cursor-pointer group shadow-sm hover:shadow-md"
          >
            <ShieldCheck className="w-6 h-6 text-rose-600 dark:text-rose-400 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-slate-100 mb-1 text-sm">Review Reports</h4>
            <span className="absolute top-4 right-4 text-[10px] font-mono bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20 dark:border-rose-500/15">
              {activeReports} PENDING
            </span>
            <p className="text-xs text-slate-400">Check student-reported issues and resolve material problems.</p>
          </button>
        </div>
      </div>
    </div>
  );
};
