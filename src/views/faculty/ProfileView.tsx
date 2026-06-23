import React, { useState } from "react";
import { Lock, Shield, Check, FileCheck, HelpCircle } from "lucide-react";
import { FacultyProfile } from "../../types";

interface ProfileViewProps {
  user: FacultyProfile;
  materialsCount: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, materialsCount }) => {
  const [designation, setDesignation] = useState(user.designation);
  const [toast, setToast] = useState("");

  const getInitials = (name: string = "") => {
    if (!name) return "MV";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToast("ADMIN PROFILE CREDENTIALS SYNCED RE-ROUTE SECURE");
    setTimeout(() => setToast(""), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans text-xs sm:text-sm">
      {/* Toast Alert popup banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 p-4 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-mono font-bold text-cyber-cyan shadow-xl animate-bounce">
          <Check className="w-4 h-4 text-cyber-cyan" />
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column Profile Identity Card Badge */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-md">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyber-cyan/40 via-cyan-500/20 to-transparent" />

          <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center font-display font-black text-2xl text-cyber-cyan shadow-md select-none uppercase mb-4">
            {getInitials(user.facultyName)}
          </div>

          <div className="space-y-1.5">
            <h3 className="font-display font-semibold text-base text-slate-100">
              {user.facultyName}
            </h3>
            <span className="inline-block text-[10px] font-mono font-bold text-cyber-cyan bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              STAFF ID: {user.facultyId}
            </span>
          </div>

          <div className="w-full pt-4 border-t border-slate-850 mt-6 space-y-2 text-[11px] font-mono text-slate-400 text-left">
            <div className="flex justify-between">
              <span>EMAIL:</span>
              <span className="text-slate-200 truncate max-w-[120px]">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span>DEPARTMENT:</span>
              <span className="text-slate-200">{user.department}</span>
            </div>
            <div className="flex justify-between">
              <span>CONTRIBUTIONS:</span>
              <span className="text-cyber-cyan font-bold font-mono">{materialsCount} resources</span>
            </div>
          </div>
        </div>

        {/* Right Column Specifications Editor Form */}
        <form onSubmit={handleSave} className="md:col-span-2 p-6 rounded-2xl cyber-glass border border-slate-700/11 dark:border-slate-800 space-y-6 shadow-md">
          <div className="flex items-center gap-2 pb-3 mb-2 border-b border-slate-850">
            <Shield className="w-4.5 h-4.5 text-cyber-cyan" />
            <h3 className="font-display font-bold text-xs text-slate-200 tracking-wide uppercase">
              Staff Academic Authorization Config
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono font-bold text-slate-450 uppercase tracking-wider block mb-1.5 animate-pulse">
                Staff Designation Title
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/20 transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono font-bold text-slate-450 uppercase tracking-wider block mb-1.5">
                Instructor Department Link
              </label>
              <input
                type="text"
                readOnly
                value={`${user.department} Department`}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-955 border border-slate-800 text-xs text-slate-500 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Guidelines info */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 flex items-start gap-2 text-slate-500 text-[11px]">
            <Lock className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              Curricular permissions are linked to your official personnel file roster and can only be customized through authorized campus administrators. Contact helpdesk if records are incorrect.
            </p>
          </div>

          {/* Submit Save */}
          <div className="pt-4 border-t border-slate-850 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyber-cyan hover:bg-cyber-cyan/90 text-slate-955 font-black text-xs cursor-pointer shadow-lg shadow-cyan-500/10 active:scale-95 transition"
            >
              Verify Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
