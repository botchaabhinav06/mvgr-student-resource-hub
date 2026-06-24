import React from "react";
import { LayoutDashboard, UploadCloud, FolderHeart, ShieldAlert, BarChart3, UserCheck, LogOut, X, Box, BookOpen, Sparkles, Shield } from "lucide-react";
import { ActiveScreen, FacultyProfile } from "../types";

interface FacultySidebarProps {
  user: FacultyProfile;
  currentScreen: ActiveScreen;
  setScreen: (screen: ActiveScreen) => void;
  onLogoutClick: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const FacultySidebar: React.FC<FacultySidebarProps> = ({
  user,
  currentScreen,
  setScreen,
  onLogoutClick,
  mobileOpen,
  setMobileOpen,
}) => {
  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      screen: "FACULTY_DASHBOARD" as ActiveScreen,
    },
    {
      label: "Upload Material",
      icon: UploadCloud,
      screen: "FACULTY_UPLOAD" as ActiveScreen,
    },
    {
      label: "Manage Materials",
      icon: FolderHeart,
      screen: "FACULTY_MANAGE" as ActiveScreen,
    },
    {
      label: "Question Papers",
      icon: BookOpen,
      screen: "FACULTY_QUESTION_PAPERS" as ActiveScreen,
    },
    {
      label: "Reports Queue",
      icon: ShieldAlert,
      screen: "FACULTY_REPORTS" as ActiveScreen,
    },
    {
      label: "AI Tools",
      icon: Sparkles,
      screen: "FACULTY_AI_TOOLS" as ActiveScreen,
    },
    {
      label: "Profile Settings",
      icon: UserCheck,
      screen: "FACULTY_PROFILE" as ActiveScreen,
    },
    ...(user.role === "admin"
      ? [
          {
            label: "User Management",
            icon: UserCheck,
            screen: "ADMIN_USERS" as ActiveScreen,
          },
          {
            label: "AI Control",
            icon: Shield,
            screen: "ADMIN_AI_CONTROL" as ActiveScreen,
          },
        ]
      : []),
  ];

  const handleNav = (screen: ActiveScreen) => {
    setScreen(screen);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-950 border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-850 dark:border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 p-1 shadow-sm">
              <img
                src="https://www.mvgrce.com/sites/default/files/logo.png"
                alt="MVGR Logo"
                className="h-6 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="font-display font-black text-sm tracking-tight text-slate-100 dark:text-white select-none whitespace-nowrap">
              MVGR <span className="text-cyber-cyan font-bold">Staff</span>
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded bg-slate-200 dark:bg-slate-900 border border-slate-350 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white lg:hidden cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto font-sans">
          {menuItems.map((item) => {
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.screen)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20 shadow-[0_0_15px_rgba(0,229,255,0.05)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
                }`}
              >
                <item.icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? "text-cyber-cyan scale-110" : "text-slate-400"}`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyber-cyan box-glow-cyan" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-855 dark:border-slate-800 bg-slate-950/80">
          <button
            onClick={onLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-transparent hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:border-rose-300 dark:hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-700 dark:text-rose-400" />
            Logout Session
          </button>
        </div>
      </aside>
    </>
  );
};
