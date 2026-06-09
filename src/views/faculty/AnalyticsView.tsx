import React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  Download, 
  Award, 
  Clock, 
  ArrowUpRight, 
  BookOpen, 
  AlertCircle, 
  Users, 
  Activity, 
  Layers 
} from "lucide-react";
import { Material, IssueReport } from "../../types";

interface AnalyticsViewProps {
  materials: Material[];
  reports?: IssueReport[];
  users?: any[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  materials,
  reports = [],
  users = [],
}) => {
  // 1. Total Materials
  const totalMaterialsCount = materials.length;

  // 2. Total Downloads
  const totalDownloads = materials.reduce((acc, current) => acc + current.downloadsCount, 0);

  // 3. Active Reports (Status is 'pending')
  const activeReportsCount = reports.filter((r) => r.status === "pending").length;

  // Average Downloads helper
  const avgDownloads = totalMaterialsCount > 0 ? (totalDownloads / totalMaterialsCount).toFixed(1) : "0";

  // 4. Student vs Faculty User Profile derived aggregates
  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalFaculty = users.filter((u) => u.role === "faculty" || u.role === "admin").length;

  // 5. Faculty Upload Count (Files uploaded grouped by department/faculty name)
  const facultyUploadStats = materials.reduce((acc: Record<string, number>, curr) => {
    const name = curr.uploadedByName || "Secondary Faculty";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  // 6. Most Downloaded Material
  const mostDownloadedMaterial = materials.length > 0 
    ? [...materials].sort((a, b) => b.downloadsCount - a.downloadsCount)[0]
    : null;

  // 7. Department-wise Material Count
  const departmentStats = materials.reduce((acc: Record<string, number>, curr) => {
    const dept = curr.department || "General IT";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const departmentList = Object.keys(departmentStats).map((dept) => ({
    name: dept,
    count: departmentStats[dept],
  }));

  // 8. Department-wise Users Count
  const departmentUserStats = users.reduce((acc: Record<string, number>, curr) => {
    const dept = curr.department || "General IT";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const departmentUserList = Object.keys(departmentUserStats).map((dept) => ({
    name: dept,
    count: departmentUserStats[dept],
  }));

  // Group by category for download distribution bar chart
  const categoryStats = materials.reduce((acc: Record<string, { downloads: number; count: number }>, curr) => {
    if (!acc[curr.category]) {
      acc[curr.category] = { downloads: 0, count: 0 };
    }
    acc[curr.category].downloads += curr.downloadsCount;
    acc[curr.category].count += 1;
    return acc;
  }, {});

  const categoriesList = Object.keys(categoryStats).map((name) => ({
    name,
    count: categoryStats[name].count,
    downloads: categoryStats[name].downloads,
    avg: (categoryStats[name].downloads / categoryStats[name].count).toFixed(0),
  }));

  // Recent Upload Activity (slice top 3 files by upload date)
  const recentUploads = [...materials]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl font-sans text-xs sm:text-sm">
      {/* Premium pipeline info banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/20 via-slate-900 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-violet-500/10 text-cyber-violet border border-violet-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            LIVE TELEMETRY STACK ONLINE
          </div>
          <h2 className="font-display font-bold text-xl text-slate-100 uppercase tracking-tight">
            Academic Analytics Suite
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Investigate real-time academic resource download spikes, track material uploads per staff member, review active discprepancy trends, and audit index-status.
          </p>
        </div>
      </div>

      {/* Grid of Core Key Metrics (6-column Bento-style Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        
        {/* Metric 1: Total Materials */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">TOTAL MATERIALS</span>
            <span className="text-2xl font-display font-bold text-slate-100 block">{totalMaterialsCount}</span>
            <span className="text-[10px] font-mono text-slate-500 block">Active folder nodes</span>
          </div>
          <div className="p-3 bg-violet-500/10 rounded-xl text-cyber-violet border border-violet-500/10">
            <BookOpen className="w-5 h-5 text-cyber-violet" />
          </div>
        </div>

        {/* Metric 2: Total Downloads */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">TOTAL DOWNLOADS</span>
            <span className="text-2xl font-display font-bold text-cyber-violet block glow-violet">{totalDownloads}</span>
            <span className="text-[10px] font-mono text-slate-500 block">Student downloads total</span>
          </div>
          <div className="p-3 bg-violet-500/15 rounded-xl text-cyber-violet border border-violet-500/15">
            <Download className="w-5 h-5 text-cyber-violet" />
          </div>
        </div>

        {/* Metric 3: Active Discrepancy Reports */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">ACTIVE ISSUES</span>
            <span className="text-2xl font-display font-bold text-amber-500 block">{activeReportsCount}</span>
            <span className="text-[10px] font-mono text-slate-500 block">Reports pending action</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/10">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        {/* Metric 4: Avg Download Count */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">AVG DOWNLOADS</span>
            <span className="text-2xl font-display font-bold text-emerald-400 block">{avgDownloads}</span>
            <span className="text-[10px] font-mono text-slate-500 block">Clicks per documents</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/10">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Metric 5: Total Students registered in Firestore */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">STUDENT DIRECTORY</span>
            <span className="text-2xl font-display font-bold text-cyan-400 block">{totalStudents}</span>
            <span className="text-[10px] font-mono text-slate-500 block">Undergraduate users</span>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/10">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* Metric 6: Active Faculty coordinates */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">ACTIVE FACULTY</span>
            <span className="text-2xl font-display font-bold text-fuchsia-400 block">{totalFaculty}</span>
            <span className="text-[10px] font-mono text-slate-500 block">Academic contributors</span>
          </div>
          <div className="p-3 bg-fuchsia-500/10 rounded-xl text-fuchsia-400 border border-fuchsia-500/10">
            <Award className="w-5 h-5 text-fuchsia-400" />
          </div>
        </div>

      </div>

      {/* Hero Section: Most Downloaded Material & Faculty Stats Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Most Downloaded Material Hero Highlight */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-violet-500/20 bg-slate-950 flex flex-col justify-between gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl group-hover:bg-violet-600/10 transition-colors duration-500" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-violet-500/20 text-cyber-violet px-2 py-0.5 rounded border border-violet-500/30">
                ⭐ TOP PERFORMANCE ACADEMIC RESOURCE
              </span>
              <Award className="w-5 h-5 text-violet-400" />
            </div>

            {mostDownloadedMaterial ? (
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-500">{mostDownloadedMaterial.category} // {mostDownloadedMaterial.id}</span>
                <h3 className="font-display font-bold text-slate-100 text-base md:text-lg tracking-tight group-hover:text-cyber-violet transition duration-200">
                  {mostDownloadedMaterial.title}
                </h3>
                <div className="flex flex-wrap gap-4 pt-1 text-[11px] font-mono text-slate-400">
                  <span>FACULTY: <span className="font-bold text-slate-200">{mostDownloadedMaterial.uploadedByName}</span></span>
                  <span>SEMESTER: <span className="font-bold text-slate-200">SEM {mostDownloadedMaterial.semester}</span></span>
                  <span>YEAR: <span className="font-bold text-slate-200">YEAR {mostDownloadedMaterial.year}</span></span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 italic">No resources registered yet.</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-905">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-display font-extrabold text-cyber-violet font-mono">{mostDownloadedMaterial?.downloadsCount || 0}</span>
              <span className="text-[10px] font-mono uppercase text-slate-500">TOTAL EXTRACTS</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
              SYSTEM RANK #1 <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Faculty Upload Contributions List */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <Users className="w-4 h-4 text-cyber-violet" />
              <h4 className="font-display font-bold text-slate-200 text-xs uppercase tracking-wide">
                Faculty Upload Contributions
              </h4>
            </div>

            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
              {Object.keys(facultyUploadStats).length > 0 ? (
                Object.keys(facultyUploadStats).map((name) => (
                  <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-850">
                    <div className="space-y-0.5 max-w-[70%] truncate">
                      <span className="font-display text-slate-200 font-medium truncate block text-xs">{name}</span>
                      <span className="text-[9px] font-mono text-slate-500 block">Syllabus Coordinator</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-cyber-violet bg-violet-500/5 px-2 py-0.5 rounded border border-violet-500/10">
                        {facultyUploadStats[name]} documents
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic p-3 text-center">No active uploads tracked.</p>
              )}
            </div>
          </div>
          <p className="text-[10px] font-mono text-slate-500 pt-3 border-t border-slate-850 mt-4 uppercase">
            HOD-approved peer monitoring active
          </p>
        </div>

      </div>

      {/* Grid: Department Distributions (Materials vs Users) & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Department-wise Material Count */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyber-violet" />
                <h4 className="font-display font-medium text-slate-200 text-xs uppercase tracking-wide">
                  Departmental Indexes Shares
                </h4>
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase">ACADEMIC GROUPS</span>
            </div>

            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {departmentList.length > 0 ? (
                departmentList.map((dept, idx) => {
                  const maxVal = Math.max(...departmentList.map((d) => d.count), 1);
                  const percent = Math.round((dept.count / maxVal) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 font-bold">{dept.name}</span>
                        <span className="text-cyber-violet font-semibold">{dept.count} documents</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full border border-slate-850 overflow-hidden p-0.5">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-gradient-to-r from-violet-600 to-cyber-violet rounded-full transition-all duration-1000 ease-out origin-left"
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic p-3 text-center">No departmental materials found.</p>
              )}
            </div>
          </div>
          <span className="text-[9px] font-mono text-slate-500 uppercase">Aggregate indexes matching departments</span>
        </div>

        {/* Department-wise Registered Users Count */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyber-violet" />
                <h4 className="font-display font-medium text-slate-200 text-xs uppercase tracking-wide">
                  Departmental User Profiles
                </h4>
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase">Registered user profiles</span>
            </div>

            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {departmentUserList.length > 0 ? (
                departmentUserList.map((dept, idx) => {
                  const maxVal = Math.max(...departmentUserList.map((d) => d.count), 1);
                  const percent = Math.round((dept.count / maxVal) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 font-bold">{dept.name}</span>
                        <span className="text-cyber-violet font-semibold">{dept.count} profiles</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full border border-slate-850 overflow-hidden p-0.5">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-gradient-to-r from-violet-600 to-cyber-violet rounded-full transition-all duration-1000 ease-out origin-left"
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic p-3 text-center">No registered user profiles found.</p>
              )}
            </div>
          </div>
          <span className="text-[9px] font-mono text-slate-500 uppercase">Student and staff profiles database share</span>
        </div>

        {/* Recent Upload Activity Timeline */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyber-violet" />
              <h4 className="font-display font-medium text-slate-200 text-xs uppercase tracking-wide">
                Recent Ingress Feeds
              </h4>
            </div>
            <span className="text-[9px] font-mono text-slate-500 uppercase">REAL-TIME FEEDS</span>
          </div>

          <div className="space-y-3.5">
            {recentUploads.length > 0 ? (
              recentUploads.map((up) => (
                <div key={up.id} className="flex gap-3 relative before:absolute before:left-2.5 before:top-6 before:bottom-0 before:w-0.5 before:bg-slate-800 last:before:hidden">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[9px] font-mono font-bold text-cyber-violet flex-shrink-0 mt-0.5">
                    •
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500 font-bold truncate pr-3">{up.uploadedByName}</span>
                      <span className="text-slate-500 flex-shrink-0">{new Date(up.uploadDate).toLocaleDateString()}</span>
                    </div>
                    <h5 className="text-slate-200 font-bold truncate text-xs leading-tight">
                      {up.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-mono">
                      CAT: {up.category} // DEPT: {up.department}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic p-3 text-center">No documents have been uploaded recently.</p>
            )}
          </div>
        </div>

      </div>

      {/* Distribution graph shares */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-850 pb-2">
          <h4 className="font-display font-medium text-slate-200 text-xs uppercase tracking-wide flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-cyber-violet" />
            Category Extraction Distribution (Student Downloads Share)
          </h4>
        </div>

        <div className="space-y-4">
          {categoriesList.length > 0 ? (
            categoriesList.map((cat, idx) => {
              const maxVal = Math.max(...categoriesList.map((c) => c.downloads), 1);
              const percent = Math.round((cat.downloads / maxVal) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold">{cat.name} ({cat.count} files)</span>
                    <span className="text-cyber-violet font-semibold">{cat.downloads} downloads (avg: {cat.avg})</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full border border-slate-850 overflow-hidden p-0.5">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-gradient-to-r from-violet-600 to-cyber-violet rounded-full transition-all duration-1000 origin-left ease-out"
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-500 italic p-3 text-center">No downloads cataloged yet.</p>
          )}
        </div>
      </div>

    </div>
  );
};
