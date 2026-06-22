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
import { getEffectiveDepartment, getEffectiveYear, getEffectiveSemester } from "../../lib/normalization";
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
  const personalizedMaterials = materials.filter((m) => {
    const studentDept = getEffectiveDepartment({ department: user.department });
    const studentYear = getEffectiveYear({ year: user.currentYear });
    const studentSem = getEffectiveSemester({ semester: user.currentSemester });
    
    const matDept = getEffectiveDepartment(m);
    const matYear = getEffectiveYear(m);
    const matSem = getEffectiveSemester(m);

    return (
      m.status === "active" &&
      studentDept === matDept &&
      studentYear === matYear &&
      studentSem === matSem
    );
  });

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
      <div className="cyber-glass relative p-6 md:p-8 rounded-2xl overflow-hidden shadow-xl border border-slate-700/10 dark:border-cyan-500/30">
        <div className="absolute top-0 right-0 p-8 text-cyan-500/5 dark:text-cyan-500/10 pointer-events-none">
          <Sparkles className="w-48 h-48 animate-pulse duration-[8000ms]" />
        </div>
        <div className="relative z-10 space-y-3.5 font-sans">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-theme-teal-action/10 text-theme-teal-action border border-theme-teal-action/20 shadow-sm">
            <Award className="w-3.5 h-3.5" />
            Academic Access Verified
          </div>
          <h2 className="font-display font-medium text-2xl md:text-3xl text-slate-100 leading-tight">
            Welcome, <span className="text-theme-teal-action font-bold">{user.fullName}</span>!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-400 max-w-xl leading-relaxed">
            Access your {user.department} Department course materials for Year {user.currentYear}, Semester {user.currentSemester} in one place.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-200 dark:text-slate-300 bg-theme-teal-action/5 px-3 py-1.5 rounded-full border border-theme-teal-action/25 shadow-sm">
              <Building className="w-4 h-4 text-theme-teal-action" />
              <span>Department: <span className="text-theme-teal-action font-semibold">{user.department}</span></span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-200 dark:text-slate-300 bg-theme-teal-action/5 px-3 py-1.5 rounded-full border border-theme-teal-action/25 shadow-sm">
              <Calendar className="w-4 h-4 text-theme-teal-action" />
              <span>Year {user.currentYear} • Semester {user.currentSemester}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cyber Student Telemetry Metrics (Strictly Personalized) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        
        {/* Metric 1: Materials available in student's specific curriculum scope */}
        <div className="p-5 rounded-xl cyber-glass flex items-center justify-between transition-all hover:translate-y-[-2px] duration-300 shadow-md">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 block font-medium">My Curriculum Notes</span>
            <span className="text-3xl font-display font-bold text-slate-100 block">{personalizedMaterials.length}</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400/70 block">Year {user.currentYear} • Semester {user.currentSemester}</span>
          </div>
          <div className="p-3 bg-theme-teal-action/10 rounded-xl text-theme-teal-action border border-theme-teal-action/20">
            <BookOpen className="w-6 h-6 text-theme-teal-action" />
          </div>
        </div>

        {/* Metric 3: Student's submitted reports ticketing tracking summary */}
        <div className="p-5 rounded-xl cyber-glass flex items-center justify-between transition-all hover:translate-y-[-2px] duration-300 shadow-md">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 block font-medium">My Reports</span>
            <span className="text-3xl font-display font-bold text-slate-100 block">
              {reports.length} <span className="text-xs text-slate-500 dark:text-slate-400/60 font-semibold uppercase">filed</span>
            </span>
            <div className="flex items-center gap-2.5 pt-0.5 text-[9px] font-mono tracking-wider">
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">• {pendingReportsCount} PENDING</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">• {resolvedReportsCount} RESOLVED</span>
            </div>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <FileText className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Student Workspace Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        
        {/* Left column: Tailored Course Curriculum Materials */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-display font-bold text-base text-slate-100 flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-theme-teal-action" />
              All Course Materials
            </h3>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-400 bg-theme-teal-action/5 px-2..5 py-0.5 rounded-full border border-theme-teal-action/10">
              Department Match Found
            </span>
          </div>

          <div className="cyber-glass rounded-2xl p-4 md:p-5 space-y-4 shadow-xl">
            {personalizedMaterials.length > 0 ? (
              <div className="space-y-3">
                {personalizedMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/30 dark:bg-slate-900/50 hover:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-700/10 dark:border-slate-800 transition-all shadow-sm hover:shadow group"
                  >
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-theme-teal-action/10 text-theme-teal-action border border-theme-teal-action/15">
                        {mat.category}
                      </span>
                      <h4 className="font-medium text-slate-100 hover:text-theme-teal-action transition-colors text-sm sm:test-base font-display">
                        {mat.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Uploaded by {mat.uploadedByName} on {new Date(mat.uploadDate).toLocaleDateString()} • Size: {mat.fileSize}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:self-center">
                      <button
                        onClick={() => triggerPreview(mat)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-950/80 dark:bg-slate-950 text-slate-200 dark:text-slate-300 font-medium text-xs border border-slate-700/10 dark:border-slate-850 hover:text-white transition cursor-pointer"
                      >
                        Instant Preview
                      </button>
                      <button
                        onClick={() => setScreen("STUDENT_BROWSE")}
                        className="px-3.5 py-1.5 rounded-lg bg-theme-teal-action/15 text-theme-teal-action font-semibold text-xs hover:bg-theme-teal-action/25 border border-theme-teal-action/20 transition cursor-pointer"
                      >
                        Download Page
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-900/10 dark:bg-slate-950/25 border border-slate-700/10 dark:border-slate-800/50 flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-theme-teal-action/10 text-theme-teal-action rounded-full border border-theme-teal-action/15">
                  <BookOpen className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-slate-100 font-medium text-sm">
                  No materials found for your current academic scope.
                </p>
                <p className="text-xs text-slate-400 max-w-md">
                  No curriculum resources currently matched {user.department} Department under Year {user.currentYear} Semester {user.currentSemester}.
                </p>
                <button
                  onClick={() => setScreen("STUDENT_BROWSE")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 mt-1 rounded-full bg-theme-teal-action text-white hover:bg-theme-teal-action/90 font-semibold text-xs transition shadow-sm cursor-pointer"
                >
                  Browse Full College Repository
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Personalized Analytics and Recent Activity Feed lists */}
        <div className="space-y-6">
          
          {/* Recent uploads in student's specific curriculum scope */}
          <div className="p-5 rounded-xl cyber-glass space-y-4 shadow-xl">
            <h4 className="font-display font-medium text-slate-100 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-theme-teal-action" />
              Recently Uploaded
            </h4>
            
            {recentlyUploaded.length > 0 ? (
              <div className="space-y-3 select-none">
                {recentlyUploaded.map((file) => (
                  <div 
                    key={file.id} 
                    onClick={() => triggerPreview(file)}
                    className="p-3 rounded-lg bg-slate-900/40 hover:bg-slate-900/80 border border-slate-700/10 dark:border-slate-850 hover:border-slate-750 transition cursor-pointer space-y-1 block shadow-sm group"
                  >
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block uppercase">
                      Uploaded {new Date(file.uploadDate).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-slate-100 block truncate text-xs hover:text-theme-teal-action group-hover:text-theme-teal-action transition-colors">
                      {file.title}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-500 block uppercase">
                      CAT: {file.category} • {file.uploadedByName}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center rounded-lg bg-slate-900/20 dark:bg-slate-950/20 border border-slate-705/10 dark:border-slate-850/50">
                <p className="text-[11px] text-slate-400 italic">No recently uploaded files in your scope.</p>
              </div>
            )}
          </div>

          {/* Core Issue Ticket Status Tracking list for Student */}
          <div className="p-5 rounded-xl cyber-glass space-y-4 shadow-xl">
            <h4 className="font-display font-medium text-slate-100 flex items-center gap-2 text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4 text-theme-teal-action" />
              My Reports
            </h4>

            {reports.length > 0 ? (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {reports.slice(0, 6).map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-700/10 dark:border-slate-850 flex items-start justify-between gap-2 text-xs shadow-sm"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="font-semibold text-slate-100 truncate block">
                        {ticket.materialTitle}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block truncate">
                        REASON: {ticket.issueType}
                      </span>
                    </div>
                    <div className="flex-shrink-0 self-center">
                      {ticket.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-amber-500 dark:text-amber-400 bg-amber-400/5 px-1.5 py-0.5 rounded border border-amber-500/20">
                          <Clock className="w-2.5 h-2.5" />
                          PENDING
                        </span>
                      ) : ticket.status === "resolved" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle className="w-2.5 h-2.5" />
                          RESOLVED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-400/10 px-1.5 py-0.5 rounded border border-slate-500/20">
                          <AlertCircle className="w-2.5 h-2.5" />
                          DISMISSED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center rounded-lg bg-slate-900/20 dark:bg-slate-950/20 border border-slate-705/10 dark:border-slate-850/50">
                <p className="text-[11px] text-slate-400 font-medium">No reports submitted yet.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
