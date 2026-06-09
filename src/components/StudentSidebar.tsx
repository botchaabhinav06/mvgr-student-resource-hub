import React from "react";
import { LayoutDashboard, BookOpen, DownloadCloud, FileText, User, LogOut, X, Box } from "lucide-react";
import { ActiveScreen } from "../types";

interface StudentSidebarProps {
  currentScreen: ActiveScreen;
  setScreen: (screen: ActiveScreen) => void;
  onLogoutClick: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
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
      screen: "STUDENT_DASHBOARD" as ActiveScreen,
    },
    {
      label: "Browse Materials",
      icon: BookOpen,
      screen: "STUDENT_BROWSE" as ActiveScreen,
    },
    {
      label: "Downloads",
      icon: DownloadCloud,
      screen: "STUDENT_DOWNLOADS" as ActiveScreen,
    },
    {
      label: "Reports",
      icon: FileText,
      screen: "STUDENT_REPORTS" as ActiveScreen,
    },
    {
      label: "Profile",
      icon: User,
      screen: "STUDENT_PROFILE" as ActiveScreen,
    },
  ];

  const handleNav = (screen: ActiveScreen) => {
    setScreen(screen);
    setMobileOpen(false); // Close on mobile navigation clicked
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
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-800 flex items-center justify-center shrink-0 p-1 shadow-sm shadow-black/40">
              <img
                src="https://www.mvgrce.com/sites/default/files/logo.png"
                alt="MVGR Logo"
                className="h-6 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="font-display font-black text-sm tracking-tight text-white select-none whitespace-nowrap">
              MVGR <span className="text-cyber-cyan font-bold">Hub</span>
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white lg:hidden cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
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
                <item.icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? "text-cyber-cyan scale-110" : "text-slate-400 group-hover:text-slate-200"}`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyber-cyan box-glow-cyan" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={onLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            Logout Session
          </button>
        </div>
      </aside>
    </>
  );
};
