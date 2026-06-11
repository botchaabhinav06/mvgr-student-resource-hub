import React, { useState } from "react";
import { Lock, Shield, Check } from "lucide-react";
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
    <div className="space-y-6 max-w-4xl font-sans">
      {/* Toast Alert popup banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 p-4 rounded-xl bg-slate-900 border border-cyber-violet/30 text-xs font-mono font-bold text-cyber-violet shadow-xl animate-bounce">
          <Check className="w-4 h-4 text-cyber-violet" />
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column Profile Identity Card Badge */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyber-cyan/35 to-cyber-violet/35" />

          <div className="w-28 h-28 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center font-display font-black text-3xl text-cyber-violet shadow-md select-none uppercase mb-4">
            {getInitials(user.facultyName)}
          </div>

          <div className="space-y-1">
            <h3 className="font-display font-semibold text-lg text-slate-100">
              {user.facultyName}
            </h3>
            <span className="text-[10px] font-mono font-bold text-cyber-violet bg-cyber-violet/10 px-2.5 py-0.5 rounded-full border border-cyber-violet/15">
              STAFF EMPLOYEE: {user.facultyId}
            </span>
          </div>

          <div className="w-full pt-4 border-t border-slate-800 mb-6 space-y-2 text-xs font-mono text-slate-400 text-left">
            <div className="flex justify-between">
              <span>EMAIL:</span>
              <span className="text-slate-200">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span>MANAGEMENT DEP:</span>
              <span className="text-slate-200">{user.department}</span>
            </div>
            <div className="flex justify-between">
              <span>CONTRIBUTED:</span>
              <span className="text-cyber-violet font-bold font-mono">{materialsCount} resources</span>
            </div>
          </div>
        </div>

        {/* Right Column Specifications Editor Form */}
        <form onSubmit={handleSave} className="md:col-span-2 p-6 rounded-2xl cyber-glass border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 pb-3 mb-2 border-b border-lite bg-slate-900 border-slate-800">
            <Shield className="w-4.5 h-4.5 text-cyber-violet" />
            <h3 className="font-display font-bold text-sm text-slate-200 tracking-wide uppercase">
              Staff Academic Authorization Config
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                Staff Designation Title
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                Instructor Department Link
              </label>
              <input
                type="text"
                readOnly
                value={`${user.department} Department`}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Submit Save */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-cyber-violet hover:bg-cyber-violet/85 text-white font-bold text-xs"
            >
              Verify Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
