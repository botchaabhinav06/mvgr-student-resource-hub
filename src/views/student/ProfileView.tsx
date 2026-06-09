import React, { useState } from "react";
import { Save, Check } from "lucide-react";
import { StudentProfile } from "../../types";

interface ProfileViewProps {
  user: StudentProfile;
  onUpdateUser: (updatedUser: StudentProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
}) => {
  const [currentYear, setCurrentYear] = useState(user.currentYear);
  const [currentSemester, setCurrentSemester] = useState(user.currentSemester);
  const [toast, setToast] = useState("");

  const getInitials = (name: string = "") => {
    if (!name) return "MV";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      currentYear,
      currentSemester,
    });
    setToast("PROFILE SYNCED // ACADEMIC DETAILS UPDATED RE-ROUTE OK");
    setTimeout(() => setToast(""), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Dynamic Toast Alert popup */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 p-4 rounded-xl bg-slate-900 border border-cyan-400 text-xs font-mono font-bold text-cyber-cyan box-glow-cyan animate-bounce">
          <Check className="w-4 h-4" />
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column Profile Identity Badge Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col items-center justify-center text-center relative overflow-hidden box-glow-cyan/5">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 to-violet-500" />

          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border-4 border-slate-800 flex items-center justify-center font-display font-black text-3xl text-cyber-cyan shadow-xl select-none uppercase">
            {getInitials(user.fullName)}
          </div>

          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl text-slate-100">
              {user.fullName}
            </h3>
            <span className="text-xs font-mono font-bold text-cyber-cyan bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/15">
              ROLL NO: {user.registerNumber}
            </span>
          </div>

          <div className="w-full pt-4 border-t border-slate-800 space-y-2 text-xs font-mono text-slate-400 text-left">
            <div className="flex justify-between">
              <span>EMAIL:</span>
              <span className="text-slate-200 text-right truncate max-w-[150px]">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span>DEPARTMENT:</span>
              <span className="text-slate-200">{user.department}</span>
            </div>
            <div className="flex justify-between">
              <span>STATUS:</span>
              <span className="text-emerald-400 font-bold uppercase">● {user.accountStatus}</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Configurations Edit panel Form */}
        <form onSubmit={handleSave} className="md:col-span-2 p-6 rounded-2xl cyber-glass border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 pb-3 mb-2 border-b border-lite bg-slate-900 border-slate-800">
            <Save className="w-4.5 h-4.5 text-cyber-cyan" />
            <h3 className="font-display font-bold text-sm text-slate-200 tracking-wide uppercase">
              User Credentials Config Workspace
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Year slider select */}
            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                Current Registered Year
              </label>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {[1, 2, 3, 4].map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr} Undergraduate
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                Updates dynamic dashboard feed content.
              </p>
            </div>

            {/* Semester Select */}
            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                Active Term Semester
              </label>
              <select
                value={currentSemester}
                onChange={(e) => setCurrentSemester(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {[1, 2].map((sm) => (
                  <option key={sm} value={sm}>
                    Semester {sm} (Term Keys)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Button Submit */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/10 cursor-pointer active:scale-95 transition"
            >
              <Save className="w-4 h-4" />
              Save Academic Profile Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
