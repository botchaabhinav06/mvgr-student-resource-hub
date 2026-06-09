import React, { useState } from "react";
import { Menu, Bell, Shield, Check, Sparkles, X, User, LogOut, ChevronDown } from "lucide-react";
import { StudentProfile, FacultyProfile, ActiveScreen, IssueReport } from "../types";

interface TopNavbarProps {
  currentScreen: ActiveScreen;
  setMobileOpenHandler: () => void;
  user: StudentProfile | FacultyProfile | null;
  reports?: IssueReport[];
  onResolveReport?: (id: string) => void;
  onDismissReport?: (id: string) => void;
  setScreen?: (screen: ActiveScreen) => void;
  onLogoutClick?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentScreen,
  setMobileOpenHandler,
  user,
  reports = [],
  onResolveReport,
  onDismissReport,
  setScreen,
  onLogoutClick,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Mapped friendly titles
  const getScreenTitle = (screen: ActiveScreen) => {
    switch (screen) {
      case "STUDENT_DASHBOARD":
        return "Student Dashboard Overview";
      case "STUDENT_BROWSE":
        return "Academic Catalog Repository";
      case "STUDENT_DOWNLOADS":
        return "Downloads History Journal";
      case "STUDENT_REPORTS":
        return "Submitted Tickets Queue";
      case "STUDENT_PROFILE":
        return "Student Profile Profile Card";
      case "FACULTY_DASHBOARD":
        return "Faculty Management Command";
      case "FACULTY_UPLOAD":
        return "Upload New Lecture Document";
      case "FACULTY_MANAGE":
        return "Academic Materials Inventory";
      case "FACULTY_REPORTS":
        return "Issue Discrepancy Dispatcher";
      case "FACULTY_ANALYTICS":
        return "Consolidated Download Analytics";
      case "FACULTY_PROFILE":
        return "Faculty Account Configuration";
      default:
        return "Academic Resource System";
    }
  };

  const isStudent = user?.role === "student";
  const accentColorClass = isStudent ? "text-cyber-cyan" : "text-cyber-violet";
  const accentBgClass = isStudent ? "bg-cyan-500/10" : "bg-violet-500/10";

  // Helper to extract initials
  const getInitials = (name: string = "") => {
    if (!name) return "MV";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const userName = isStudent 
    ? (user as StudentProfile)?.fullName 
    : (user as FacultyProfile)?.facultyName;
    
  const userInitials = getInitials(userName);

  return (
    <header className="sticky top-0 z-30 h-16 w-full flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center gap-4">
        {/* Toggle Menu Button for Mobile */}
        <button
          onClick={setMobileOpenHandler}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-display font-bold text-base md:text-lg text-slate-100 tracking-tight leading-none">
            {getScreenTitle(currentScreen)}
          </h1>
          <p className="text-[10px] font-mono text-slate-500 mt-1 hidden sm:block uppercase">
            MVGR RESOURCE HUB // ID: <span className={`${accentColorClass} font-bold`}>{user?.role === "student" ? (user as StudentProfile).registerNumber : (user as FacultyProfile).facultyId}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 relative">
        {/* Notifications Dispatcher Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileDropdown(false);
            }}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer flex gap-1 items-center"
          >
            <Bell className="w-4 h-4" />
            {reports.filter(r => user?.role === "student" ? (r.studentRoll === (user as StudentProfile).registerNumber && r.status === "pending") : r.status === "pending").length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-2 ring-slate-950 animate-pulse">
                {reports.filter(r => user?.role === "student" ? (r.studentRoll === (user as StudentProfile).registerNumber && r.status === "pending") : r.status === "pending").length}
              </span>
            )}
          </button>

          {/* Dynamic notifications drop card */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-3.5 w-80 md:w-96 z-50 rounded-xl bg-slate-900 border border-slate-800 shadow-xl p-4 box-glow-cyan animate-in fade-in slide-in-from-top-2 duration-200 font-sans">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
                    LIVE ALERTS MONITOR
                  </span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[10px] text-slate-400 font-mono hover:text-slate-100 uppercase"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {user?.role === "faculty" || user?.role === "admin" ? (
                    // FACULTY DISPATCH NOTIFICATIONS
                    <>
                      <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-1">
                        PENDING ACADEMIC INQUIRIES
                      </div>
                      {reports.filter(r => r.status === "pending").length > 0 ? (
                        reports.filter(r => r.status === "pending").map((rep) => (
                          <div key={rep.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/15 font-bold uppercase">
                                {rep.issueType}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">
                                {rep.id}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-200 font-bold text-[11px] truncate">
                                {rep.materialTitle}
                              </p>
                              <p className="text-slate-400 text-[10px] leading-relaxed italic">
                                "{rep.description}"
                              </p>
                              <p className="text-slate-500 text-[9px] font-mono leading-none">
                                Student: {rep.studentName} ({rep.studentRoll})
                              </p>
                            </div>
                            {/* Action shortcuts inside notification */}
                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-850">
                              <button
                                onClick={() => {
                                  onDismissReport?.(rep.id);
                                }}
                                className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[9px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => {
                                  onResolveReport?.(rep.id);
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 text-[9px] font-bold hover:bg-emerald-400 cursor-pointer"
                              >
                                Resolve
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-slate-500 text-xs">
                          No outstanding error reports. System normal!
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          setScreen?.("FACULTY_REPORTS");
                        }}
                        className="w-full mt-2 py-2 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-mono font-bold text-cyber-cyan text-center block"
                      >
                        VIEW ALL DISCREPANCY REPORTS
                      </button>
                    </>
                  ) : (
                    // STUDENT NOTIFICATIONS
                    <>
                      <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-1">
                        YOUR REGISTERED DISCREPANCY FLOWS
                      </div>
                      {reports.filter(r => r.studentRoll === (user as StudentProfile).registerNumber).length > 0 ? (
                        reports.filter(r => r.studentRoll === (user as StudentProfile).registerNumber).slice(0, 3).map((rep) => (
                          <div key={rep.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono bg-cyan-500/10 text-cyber-cyan px-1.5 py-0.5 rounded border border-cyan-500/15 uppercase font-bold">
                                {rep.issueType}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">
                                {rep.id}
                              </span>
                            </div>
                            <h5 className="text-slate-300 font-semibold text-[11px] truncate">
                              {rep.materialTitle}
                            </h5>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-850">
                              <span className="text-[9px] font-mono text-slate-400">
                                STATUS UPDATE:
                              </span>
                              {rep.status === "pending" ? (
                                <span className="text-[9px] font-mono font-bold text-amber-500">AWAITING REVIEW</span>
                              ) : rep.status === "resolved" ? (
                                <span className="text-[9px] font-mono font-bold text-emerald-400">RESOLVED BY STAFF</span>
                              ) : (
                                <span className="text-[9px] font-mono font-bold text-slate-400">DISMISSED BY STAFF</span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-slate-500 text-xs">
                          You haven't filed any issue reports.
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          setScreen?.("STUDENT_REPORTS");
                        }}
                        className="w-full mt-2 py-2 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-mono font-bold text-cyber-cyan text-center block"
                      >
                        VIEW INCIDENT ARCHIVES
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Badge Profile with PREMIUM DROPDOWN (FIX 4) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);
            }}
            className={`flex items-center gap-2 pl-3 border-l border-slate-800 text-left cursor-pointer hover:opacity-90 select-none transition`}
          >
            <div className="hidden lg:block text-right">
              <span className="text-xs font-bold font-display text-slate-100 block">
                {userName}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500 block">
                {user?.role === "student" ? "STUDENT AC" : "COORD / STAFF"}
              </span>
            </div>
            
            {/* Round Initials placeholder - NO PHOTO AVATAR ON TOP PORTAL (FIX 4) */}
            <div className={`w-8 h-8 rounded-lg ${accentBgClass} border-2 ${isStudent ? 'border-cyan-500/20' : 'border-violet-500/20'} flex items-center justify-center font-display font-black text-xs ${accentColorClass} uppercase shadow-sm`}>
              {userInitials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Premium Dropdown menu (FIX 4) */}
          {showProfileDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
              <div className="absolute right-0 mt-3.5 w-64 z-50 rounded-xl bg-slate-900 border border-slate-800 shadow-xl p-4 box-glow-cyan animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* Visual Header */}
                <div className="pb-3 mb-3 border-b border-slate-800 flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${accentBgClass} flex items-center justify-center font-display font-black text-xs ${accentColorClass}`}>
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-100 truncate">{userName}</p>
                    <p className="text-[9px] font-mono text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Account details rows */}
                <div className="space-y-2 mb-4 font-mono text-[10px] text-slate-400">
                  {isStudent ? (
                    <>
                      <div className="flex justify-between">
                        <span>ROLL ID:</span>
                        <span className="text-slate-200 font-bold">{(user as StudentProfile).registerNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DEPARTMENT:</span>
                        <span className="text-slate-200">{(user as StudentProfile).department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ACADEMIC YEAR:</span>
                        <span className="text-slate-200">{(user as StudentProfile).currentYear} Year</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SEMESTER:</span>
                        <span className="text-slate-200">{(user as StudentProfile).currentSemester} Semester</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>STAFF ID:</span>
                        <span className="text-slate-200 font-bold">{(user as FacultyProfile).facultyId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DEPARTMENT:</span>
                        <span className="text-slate-200">{(user as FacultyProfile).department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DESIGNATION:</span>
                        <span className="text-slate-200">{(user as FacultyProfile).designation}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Dropdown Operations */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800 font-sans">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setScreen?.(isStudent ? "STUDENT_PROFILE" : "FACULTY_PROFILE");
                    }}
                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    Profile Workspace
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onLogoutClick?.();
                    }}
                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-rose-500/10 hover:text-rose-450 text-slate-400 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    Logout Account
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
