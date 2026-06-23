import React, { useState } from "react";
import { AlertTriangle, Clock, Check, Inbox, Tag, User, Calendar, ShieldCheck, XCircle, ArrowRight } from "lucide-react";
import { IssueReport, ActiveScreen } from "../../types";

interface ReportsViewProps {
  reports: IssueReport[];
  onResolveReport: (id: string) => void;
  onDismissReport: (id: string) => void;
  onDeleteReport: (id: string) => void;
  setScreen: (screen: ActiveScreen) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  onResolveReport,
  onDismissReport,
  onDeleteReport,
  setScreen,
}) => {
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "resolved" | "dismissed">("pending");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleResolve = (id: string) => {
    onResolveReport(id);
    setToast("TICKET RESOLVED // CLOUD ARCHIVE DISPATCHED");
    setTimeout(() => setToast(""), 3500);
  };

  const handleDismiss = (id: string) => {
    onDismissReport(id);
    setToast("TICKET RETIRED // RECORD FILED AS DISMISSED");
    setTimeout(() => setToast(""), 3500);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      onDeleteReport(id);
      setDeleteConfirmId(null);
      setToast("TICKET DELETED // PURGED FROM DISCREPANCY LOGS");
      setTimeout(() => setToast(""), 3500);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 4000); // auto reset
    }
  };

  const pendingReports = reports.filter((r) => r.status === "pending");
  const resolvedReports = reports.filter((r) => r.status === "resolved");
  const dismissedReports = reports.filter((r) => r.status === "dismissed");

  const getFilteredReports = () => {
    if (activeTab === "resolved") return resolvedReports;
    if (activeTab === "dismissed") return dismissedReports;
    return pendingReports;
  };

  const displayedReports = getFilteredReports();

  return (
    <div className="space-y-6 relative max-w-7xl font-sans text-xs sm:text-sm">
      {/* Toast Alert popup banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 p-4 rounded-xl bg-slate-900 border border-emerald-400 text-xs font-mono font-bold text-emerald-400 box-glow-violet animate-bounce shadow-xl">
          <Check className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-medium text-lg md:text-xl text-slate-100 uppercase tracking-tight">
            Student Incident Reports Center
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Undergraduates report files that are illegible, tagged in incorrect syllabus slots, or broken. Monitor and inspect reported logs in real-time.
          </p>
        </div>
      </div>

      {/* Premium Tab Selector Row */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-950 border border-slate-800 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 py-1.5 px-3 rounded-lg font-mono text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "pending"
              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending ({pendingReports.length})
        </button>
        <button
          onClick={() => setActiveTab("resolved")}
          className={`flex-1 py-1.5 px-3 rounded-lg font-mono text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "resolved"
              ? "bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          Resolved ({resolvedReports.length})
        </button>
        <button
          onClick={() => setActiveTab("dismissed")}
          className={`flex-1 py-1.5 px-3 rounded-lg font-mono text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "dismissed"
              ? "bg-slate-800 text-slate-300 border border-slate-700"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Dismissed ({dismissedReports.length})
        </button>
      </div>

      {displayedReports.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-850">
            <span className="uppercase">
              Real-time Audit {activeTab} Channels ({displayedReports.length} Active Tickets)
            </span>
            <span className="animate-pulse text-cyber-cyan font-bold">SYSTEM SCANNING OK</span>
          </div>

          <div className="space-y-4">
            {displayedReports.map((rep) => (
              <div
                key={rep.id}
                className={`p-5 rounded-xl border bg-slate-900/40 hover:bg-slate-900/60 transition duration-150 flex flex-col md:flex-row md:items-start justify-between gap-6 ${
                  activeTab === "pending"
                    ? "border-amber-500/10 hover:border-amber-500/30"
                    : activeTab === "resolved"
                    ? "border-cyan-500/10 hover:border-cyan-500/30"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-3.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Badge Category */}
                    {activeTab === "pending" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/15">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        {rep.issueType}
                      </span>
                    ) : activeTab === "resolved" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyber-cyan border border-cyan-500/15">
                        <Check className="w-3.5 h-3.5 text-cyber-cyan" />
                        {rep.issueType}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-750">
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                        {rep.issueType}
                      </span>
                    )}

                    <span className="text-[10px] font-mono text-slate-500">
                      TICKET REQ ID: {rep.id} // FILED: {new Date(rep.reportDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-display font-medium text-slate-200 text-sm md:text-base leading-snug">
                      {rep.materialTitle}
                    </h4>
                    <p className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 italic font-sans leading-relaxed">
                      " {rep.description} "
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-[10px] font-mono text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      STUDENT: <span className="text-slate-300 font-semibold">{rep.studentName} ({rep.studentRoll})</span>
                    </span>
                    {rep.facultyName && (
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        FACULTY ASSIGNED: <span className="text-slate-300 font-semibold">{rep.facultyName}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Lifecycle action buttons */}
                {activeTab === "pending" && (
                  <div className="md:self-center flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleResolve(rep.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyber-cyan hover:bg-cyber-cyan/95 text-slate-955 text-xs font-black shadow-lg transition cursor-pointer active:scale-95"
                    >
                      <Check className="w-4 h-4 text-slate-950" />
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleDismiss(rep.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 text-xs font-bold border border-slate-800 transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-slate-400" />
                      Dismiss Issue
                    </button>
                    <button
                      onClick={() => handleDelete(rep.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/25 transition cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      {deleteConfirmId === rep.id ? "Confirm Delete?" : "Delete Ticket"}
                    </button>
                  </div>
                )}

                {activeTab !== "pending" && (
                  <div className="md:self-center flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0">
                    <div className="flex items-center justify-center gap-1.5 font-mono text-[10px] px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-500 select-none">
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                      <span>LIFECYCLE RETIRED</span>
                    </div>
                    <button
                      onClick={() => handleDelete(rep.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/25 transition cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      {deleteConfirmId === rep.id ? "Confirm Purge?" : "Purge Record"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty states based on premium styling rules */
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-slate-800 rounded-2xl max-w-lg mx-auto font-sans">
          <div className="w-14 h-14 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
            <Inbox className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="font-display font-medium text-lg text-slate-200 mb-1">
            No incident reports here.
          </h3>
          <p className="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed">
            There are currently zero discrepancy reports in the "{activeTab.toUpperCase()}" channel. System catalogs are working seamlessly list sync.
          </p>
          <button
            onClick={() => setScreen("FACULTY_DASHBOARD")}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 font-mono tracking-wider font-bold text-xs active:scale-95 transition flex items-center gap-1 cursor-pointer"
          >
            Terminal Dashboard
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
      )}
    </div>
  );
};
