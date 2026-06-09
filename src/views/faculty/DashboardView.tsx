import React from "react";
import { FolderPlus, Layers, ShieldCheck, Mail, Users, FileBarChart, Sparkles, Building2 } from "lucide-react";
import { FacultyProfile, Material, IssueReport, ActiveScreen } from "../../types";

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
      <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-slate-900 border border-violet-500/20 box-glow-violet overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-violet-500/10 pointer-events-none">
          <Sparkles className="w-48 h-48 animate-pulse" />
        </div>
        <div className="relative z-10 space-y-3 font-sans">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-violet-500/10 text-cyber-violet border border-violet-500/20">
            <Building2 className="w-3.5 h-3.5" />
            MVGR CORE FACULTY PORTAL TERMINAL SECURED
          </div>
          <h2 className="font-display font-medium text-2xl md:text-3xl text-slate-100 leading-tight">
            Greetings, <span className="text-cyber-violet font-bold">{user.facultyName}</span>!
          </h2>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Welcome to the Course Resource HOD system panel. Easily compile, upload, and inventory materials to facilitate seamless accessibility for our students.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 font-mono">
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              DESIGNATION: <span className="text-cyber-violet font-semibold">{user.designation}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              DEPARTMENT: <span className="text-cyber-violet font-semibold">{user.department}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Metric Codes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
        <div className="p-5 rounded-xl cyber-glass border border-slate-800 flex items-center justify-between box-glow-violet">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">MY UPLOADED INVENTORY</span>
            <span className="text-3xl font-display font-bold text-slate-100 block">{totalUploaded} / {materials.length}</span>
            <span className="text-[10px] font-mono text-slate-500 block">Total materials: {materials.length}</span>
          </div>
          <div className="p-3 bg-violet-500/10 rounded-xl text-cyber-violet border border-violet-500/10">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl cyber-glass border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">TOTAL CATALOG CLICKS</span>
            <span className="text-3xl font-display font-bold text-cyber-violet block glow-violet">{totalDownloads}</span>
            <span className="text-[10px] font-mono text-slate-500 block">Accumulated dynamic clicks</span>
          </div>
          <div className="p-3 bg-violet-500/20 rounded-xl text-cyber-violet border border-cyber-violet/25">
            <FileBarChart className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl cyber-glass border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">UNRESOLVED TICKETS STATUS</span>
            <span className="text-3xl font-display font-bold text-rose-400 block">{activeReports}</span>
            <span className="text-[10px] font-mono text-slate-500 block">Requiring immediate audit action</span>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/15">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main launch pads dashboard shortcuts */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-200">
          Faculty Quick Launch Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setScreen("FACULTY_UPLOAD")}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-left hover:bg-slate-900/50 transition duration-150 relative cursor-pointer group"
          >
            <FolderPlus className="w-6 h-6 text-cyber-violet mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-slate-100 mb-1 text-sm">Upload Academic Material</h4>
            <p className="text-xs text-slate-400">Share textbooks, dynamic notes, and mid-term exam papers directly.</p>
          </button>

          <button
            onClick={() => setScreen("FACULTY_MANAGE")}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-left hover:bg-slate-900/50 transition duration-150 relative cursor-pointer group"
          >
            <Layers className="w-6 h-6 text-cyber-violet mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-slate-100 mb-1 text-sm">Inventory Catalogue</h4>
            <p className="text-xs text-slate-400">Manage existing materials, soft delete outdated copies, and edit details.</p>
          </button>

          <button
            onClick={() => setScreen("FACULTY_REPORTS")}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-left hover:bg-slate-900/50 transition duration-150 relative cursor-pointer group"
          >
            <ShieldCheck className="w-6 h-6 text-rose-400 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-slate-100 mb-1 text-sm">Discrepancy Resolver Stream</h4>
            <span className="absolute top-4 right-4 text-[10px] font-mono bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/15">
              {activeReports} PENDING
            </span>
            <p className="text-xs text-slate-400">Inspect reported broken links or scan clarity complaints filed by undergraduates.</p>
          </button>
        </div>
      </div>
    </div>
  );
};
