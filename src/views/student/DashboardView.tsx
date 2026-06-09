import React from "react";
import { 
  BookOpen, 
  FileText, 
  Download, 
  Calendar, 
  Compass, 
  Award, 
  Building, 
  Sparkles, 
  HelpCircle, 
  AlertCircle, 
  Clock, 
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { StudentProfile, Material, IssueReport, ActiveScreen } from "../../types";

interface DashboardViewProps {
  user: StudentProfile;
  materials: Material[];
  reports: IssueReport[];
  setScreen: (screen: ActiveScreen) => void;
  recordedDownloadsCount: number;
  triggerPreview: (material: Material) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  materials,
  reports,
  setScreen,
  recordedDownloadsCount,
  triggerPreview,
}) => {
  // Personalization: filter materials matching student's year, sem, and department
  const personalizedMaterials = materials.filter(
    (m) =>
      m.department === user.department &&
      String(m.year) === String(user.currentYear) &&
      String(m.semester) === String(user.currentSemester)
  );

  // Student specific analytics derived dynamically
  const pendingReportsCount = reports.filter((r) => r.status === "pending").length;
  const resolvedReportsCount = reports.filter((r) => r.status === "resolved").length;

  // 1. Recently uploaded matching student scope (Year, Sem, Dept)
  const recentlyUploaded = [...personalizedMaterials]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 3);

  // 2. Popular materials matching student scope
  const popularMaterialsInScope = [...personalizedMaterials]
    .sort((a, b) => b.downloadsCount - a.downloadsCount)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Banner */}
      <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/20 box-glow-cyan overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-cyan-500/10 pointer-events-none">
          <Sparkles className="w-48 h-48" />
        </div>
        <div className="relative z-10 space-y-3 font-sans">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20">
            <Award className="w-3.5 h-3.5" />
            MVGR CORE SECURE INTEGRITY VERIFIED
          </div>
          <h2 className="font-display font-medium text-2xl md:text-3xl text-slate-100 leading-tight">
            Welcome, <span className="text-cyber-cyan font-bold">{user.fullName}</span>!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Your personal hub is synched with the **{user.department} Department** catalog for 
            **Year {user.currentYear}, Semester {user.currentSemester}**.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <Building className="w-4 h-4 text-cyber-cyan" />
              Dep: <span className="text-cyber-cyan font-semibold">{user.department}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <Calendar className="w-4 h-4 text-cyber-cyan" />
              Syllabus Year: <span className="text-cyber-cyan font-semibold">{user.currentYear} - S{user.currentSemester}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cyber Student Telemetry Metrics (Strictly Personalized) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
        
        {/* Metric 1: Materials available in student's specific curriculum scope */}
        <div className="p-5 rounded-xl cyber-glass border border-slate-800 flex items-center justify-between box-glow-cyan">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">MY CURRICULUM NODES</span>
            <span className="text-3xl font-display font-bold text-slate-100 block">{personalizedMaterials.length}</span>
            <span className="text-[10px] font-mono text-slate-500 block">Year {user.currentYear} • Sem {user.currentSemester}</span>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyber-cyan border border-cyan-500/10">
            <BookOpen className="w-6 h-6 text-cyber-cyan" />
          </div>
        </div>

        {/* Metric 2: Total Session Downloads */}
        <div className="p-5 rounded-xl cyber-glass border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">MY SESSION DOWNLOADS</span>
            <span className="text-3xl font-display font-bold text-cyber-cyan block glow-cyan">{recordedDownloadsCount}</span>
            <span className="text-[10px] font-mono text-slate-500 block">Downloaded this session</span>
          </div>
          <div className="p-3 bg-cyan-500/20 rounded-xl text-cyber-cyan border border-cyber-cyan/25">
            <Download className="w-6 h-6 animate-bounce" />
          </div>
        </div>

        {/* Metric 3: Student's submitted reports ticketing tracking summary */}
        <div className="p-5 rounded-xl cyber-glass border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">MY DISCREPANCY TICKETS</span>
            <span className="text-2xl font-display font-bold text-slate-100 block">
              {reports.length} <span className="text-xs text-slate-500 font-normal">filed</span>
            </span>
            <div className="flex items-center gap-2 pt-0.5 text-[9px] font-mono uppercase">
              <span className="text-rose-400 font-bold">• {pendingReportsCount} PENDING</span>
              <span className="text-emerald-400 font-bold">• {resolvedReportsCount} RESOLVED</span>
            </div>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/15">
            <FileText className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Student Workspace Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        
        {/* Left column: Tailored Course Curriculum Materials */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-100 flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-cyber-cyan" />
              Tailored Course Materials
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Department Match Found
            </span>
          </div>

          {personalizedMaterials.length > 0 ? (
            <div className="space-y-3">
              {personalizedMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/65 border border-slate-800 hover:border-slate-700/80 transition-all hover:bg-slate-900 group"
                >
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20">
                      {mat.category}
                    </span>
                    <h4 className="font-medium text-slate-200 group-hover:text-cyber-cyan transition-colors text-sm sm:text-base">
                      {mat.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Uploaded by {mat.uploadedByName} on {new Date(mat.uploadDate).toLocaleDateString()} // Size: {mat.fileSize}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:self-center">
                    <button
                      onClick={() => triggerPreview(mat)}
                      className="px-4 py-1.5 rounded-lg bg-slate-950 text-slate-300 font-medium text-xs hover:bg-slate-850 hover:text-white border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                    >
                      Instant Preview
                    </button>
                    <button
                      onClick={() => setScreen("STUDENT_BROWSE")}
                      className="px-4 py-1.5 rounded-lg bg-cyan-500/15 text-cyber-cyan font-bold text-xs hover:bg-cyan-500/25 border border-cyan-500/20 transition cursor-pointer"
                    >
                      Download Page
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-slate-900/30 border border-slate-800 space-y-2">
              <p className="text-slate-400 font-medium text-sm">
                No materials available yet. No curriculum matching {user.department} - Year {user.currentYear} - Sem {user.currentSemester} is on file.
              </p>
              <button
                onClick={() => setScreen("STUDENT_BROWSE")}
                className="text-xs text-cyber-cyan underline hover:text-cyan-400 cursor-pointer"
              >
                Browse overall college inventory repository
              </button>
            </div>
          )}
        </div>

        {/* Right column: Personalized Analytics and Recent Activity Feed lists */}
        <div className="space-y-6">
          
          {/* Recent uploads in student's specific curriculum scope */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h4 className="font-display font-bold text-slate-100 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-cyan-400" />
              Recently Uploaded (My Scope)
            </h4>
            
            {recentlyUploaded.length > 0 ? (
              <div className="space-y-3 select-none">
                {recentlyUploaded.map((file) => (
                  <div 
                    key={file.id} 
                    onClick={() => triggerPreview(file)}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-850 hover:border-slate-700/60 transition cursor-pointer space-y-1 block"
                  >
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">
                      Uploaded {new Date(file.uploadDate).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-slate-300 block truncate text-xs hover:text-cyber-cyan">
                      {file.title}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">
                      CAT: {file.category} // Faculty: {file.uploadedByName}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">No recently uploaded files in your scope.</p>
            )}
          </div>

          {/* Popular materials matching student scope */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h4 className="font-display font-bold text-slate-100 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Popular Materials (My Scope)
            </h4>

            {popularMaterialsInScope.length > 0 ? (
              <div className="space-y-3">
                {popularMaterialsInScope.map((file) => (
                  <div 
                    key={file.id} 
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-850 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="font-semibold text-slate-300 block truncate text-xs">
                        {file.title}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 block">
                        CAT: {file.category}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-mono font-bold text-cyber-cyan bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                        {file.downloadsCount} downloads
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">No popular resources listed yet.</p>
            )}
          </div>

          {/* Core Issue Ticket Status Tracking list for Student */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h4 className="font-display font-bold text-slate-100 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4 text-cyan-400" />
              My Ticket Discrepancies
            </h4>

            {reports.length > 0 ? (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {reports.slice(0, 4).map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-850 flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="font-semibold text-slate-300 truncate block">
                        {ticket.materialTitle}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 block truncate">
                        REASON: {ticket.issueType}
                      </span>
                    </div>
                    <div className="flex-shrink-0 self-center">
                      {ticket.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-amber-400 bg-amber-400/5 px-1.5 py-0.5 rounded border border-amber-400/15">
                          <Clock className="w-2.5 h-2.5" />
                          PENDING
                        </span>
                      ) : ticket.status === "resolved" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
                          <CheckCircle className="w-2.5 h-2.5" />
                          RESOLVED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-slate-400 bg-slate-400/10 px-1.5 py-0.5 rounded border border-slate-400/20">
                          <AlertCircle className="w-2.5 h-2.5" />
                          DISMISSED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center rounded-lg bg-slate-950/20 border border-slate-850">
                <p className="text-[11px] text-slate-500 font-medium">No reports submitted yet.</p>
              </div>
            )}
          </div>

          {/* Academic Help Desk Info Widget */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="font-display font-bold text-slate-100 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                Academic Help Desk
              </h4>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                  <p className="font-mono text-cyan-400 font-semibold uppercase text-[10px]">How do I report files?</p>
                  <p className="leading-relaxed">
                    Go to "Browse Materials", click "Report Issue", select type and explain details. Department HOD is updated instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
