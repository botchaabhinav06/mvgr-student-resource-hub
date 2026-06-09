import React from "react";
import { HelpCircle, Clock, CheckCircle2, Ticket, Sparkles, Building2, AlertTriangle, XCircle } from "lucide-react";
import { IssueReport, StudentProfile } from "../../types";

interface ReportsViewProps {
  user: StudentProfile;
  reports: IssueReport[];
  setScreen: (screen: "STUDENT_BROWSE") => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  user,
  reports,
  setScreen,
}) => {
  // Filter reports submitted by this student matching their credentials
  const studentReports = reports.filter(
    (rep) => rep.studentRoll === user.registerNumber
  );

  return (
    <div className="space-y-6">
      {/* Informative description */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center gap-1.5 font-mono text-xs text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-full w-fit border border-rose-500/15">
          <AlertTriangle className="w-3.5 h-3.5" />
          DISCREPANCY PROTOCOL AUDIT QUEUE
        </div>
        <h2 className="font-display font-medium text-xl text-slate-100 uppercase tracking-tight">
          Submissions Issue Tracker
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
          Check live statuses of academic reports you filed. Assigned HOD faculty moderators audit reports in real-time to replace missing PDFs, re-classify categories, or re-upload poor visibility documents.
        </p>
      </div>

      {studentReports.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800">
            <span>MY DISCREPANCY FLOW TICKETS ({studentReports.length} FILED)</span>
            <span>SYSTEM AUDIT ENFORCED</span>
          </div>

          <div className="space-y-3">
            {studentReports.map((rep) => (
              <div
                key={rep.id}
                className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-slate-300 border border-slate-800">
                      <Ticket className="w-3 h-3 text-cyan-400" />
                      ID: {rep.id}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/15">
                      {rep.issueType}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-display font-medium text-slate-200 text-sm md:text-base">
                      {rep.materialTitle}
                    </h4>
                    <p className="text-xs text-slate-400 italic">
                      " {rep.description} "
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      FILED ON: {new Date(rep.reportDate).toLocaleDateString()} @ {new Date(rep.reportDate).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="sm:self-center flex flex-col items-start sm:items-end gap-2">
                  <span className="text-[10px] font-mono text-slate-500 block">
                    CURRENT STATE
                  </span>
                  {rep.status === "pending" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      Awaiting Audit
                    </span>
                  ) : rep.status === "resolved" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved by HOD
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      Dismissed by HOD
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-slate-800 rounded-2xl max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-500 mb-4">
            <Ticket className="w-6 h-6 text-rose-500" />
          </div>
          <h3 className="font-display font-medium text-lg text-slate-200 mb-1">
            No discrepancy reports registered.
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">
            All course documents are in certified status. If you found a file error, you can submit tickets right from the Browse tab.
          </p>
          <button
            onClick={() => setScreen("STUDENT_BROWSE")}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-xs active:scale-95 transition"
          >
            Browse Materials Repository
          </button>
        </div>
      )}
    </div>
  );
};
