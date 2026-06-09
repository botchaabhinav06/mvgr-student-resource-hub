import React, { useState } from "react";
import { Search, SlidersHorizontal, DownloadCloud, Eye, AlertTriangle, X, Check, FileSearch, Loader2 } from "lucide-react";
import { Material, IssueReport, StudentProfile } from "../../types";
import { EmptyState } from "../../components/EmptyState";
import { DEPARTMENTS, MATERIAL_CATEGORIES } from "../../mockData";

interface BrowseViewProps {
  user: StudentProfile;
  materials: Material[];
  onDownload: (material: Material) => void;
  triggerPreview: (material: Material) => void;
  onSubmitReport: (report: Omit<IssueReport, "id" | "studentName" | "studentRoll" | "reportDate" | "status">) => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({
  user,
  materials,
  onDownload,
  triggerPreview,
  onSubmitReport,
}) => {
  // Query Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedSem, setSelectedSem] = useState("All");
  const [selectedCat, setSelectedCat] = useState("All");

  // Report issue flow state
  const [reportingMaterial, setReportingMaterial] = useState<Material | null>(null);
  const [issueType, setIssueType] = useState<IssueReport["issueType"]>("Wrong PDF");
  const [issueDesc, setIssueDesc] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadClick = async (mat: Material) => {
    if (downloadingId) return;
    setDownloadingId(mat.id);
    try {
      await onDownload(mat);
    } catch (err) {
      console.error("Direct download failed in browse view:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDept("All");
    setSelectedYear("All");
    setSelectedSem("All");
    setSelectedCat("All");
  };

  // Filter logic
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "All" || m.department === selectedDept;
    const matchesYear = selectedYear === "All" || m.year.toString() === selectedYear;
    const matchesSem = selectedSem === "All" || m.semester.toString() === selectedSem;
    const matchesCat = selectedCat === "All" || m.category === selectedCat;

    return matchesSearch && matchesDept && matchesYear && matchesSem && matchesCat;
  });

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingMaterial) return;

    onSubmitReport({
      materialId: reportingMaterial.id,
      materialTitle: reportingMaterial.title,
      issueType,
      description: issueDesc,
    });

    setReportingMaterial(null);
    setIssueDesc("");
    setIssueType("Wrong PDF");

    // Success Toast
    setToastMessage("TICKET FILED // DISCREPANCY RECORDED FOR REVIEW");
    setTimeout(() => setToastMessage(""), 4000);
  };

  const departments = ["All", ...DEPARTMENTS];
  const years = ["All", "1", "2", "3", "4"];
  const semesters = ["All", "1", "2"];
  const categories = ["All", ...MATERIAL_CATEGORIES];

  return (
    <div className="space-y-6 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 p-4 rounded-xl bg-slate-900 border border-cyan-400 text-xs font-mono font-bold text-cyber-cyan box-glow-cyan animate-bounce">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Filter and Search Action Console Panel */}
      <div className="p-5 rounded-2xl cyber-glass border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <SlidersHorizontal className="w-4 h-4 text-cyber-cyan" />
          <h3 className="font-display font-bold text-sm text-slate-200 tracking-wide uppercase">
            Materials Navigator Dashboard Filters
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3.5 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by keywords or file tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition font-sans"
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All Departments" : `${d} Department`}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y === "All" ? "All Years" : `Year ${y}`}
                </option>
              ))}
            </select>
          </div>

          {/* Semester / Category Filter Row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Sem
              </label>
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
                className="w-full px-2 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {semesters.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "S-All" : `S${s}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Category
              </label>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full px-2 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "Cat-All" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-cyan-500/30 transition-all duration-200 flex flex-col justify-between group box-glow-cyan/5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20">
                    {mat.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {mat.fileSize}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-display font-medium text-slate-100 group-hover:text-cyber-cyan transition-colors leading-snug">
                    {mat.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-sans">
                    By {mat.uploadedByName} ({mat.department} Dept)
                  </p>
                </div>

                {/* Meta details tag */}
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 grid grid-cols-2 gap-y-1 text-[11px] font-mono text-slate-500">
                  <div>
                    YEAR: <span className="text-slate-300 font-bold">{mat.year}</span>
                  </div>
                  <div>
                    SEM: <span className="text-slate-300 font-bold">semester {mat.semester}</span>
                  </div>
                  <div>
                    DATE: <span className="text-slate-400">{new Date(mat.uploadDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    DOWNLOADS: <span className="text-cyber-cyan font-bold">{mat.downloadsCount}</span>
                  </div>
                </div>
              </div>

              {/* Action grid bottom */}
              <div className="grid grid-cols-3 gap-2 mt-5">
                <button
                  onClick={() => triggerPreview(mat)}
                  className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-slate-950 text-slate-300 text-xs font-semibold border border-slate-800 hover:bg-slate-850 hover:text-white transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>

                <button
                  onClick={() => handleDownloadClick(mat)}
                  disabled={downloadingId === mat.id}
                  className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-cyan-500 disabled:opacity-55 disabled:bg-cyan-500/50 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  {downloadingId === mat.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Wait...
                    </>
                  ) : (
                    <>
                      <DownloadCloud className="w-3.5 h-3.5" />
                      Download
                    </>
                  )}
                </button>

                <button
                  onClick={() => setReportingMaterial(mat)}
                  className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 text-xs font-medium hover:text-rose-200 transition cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Report Issue
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState type="no-materials" onAction={resetFilters} />
      )}

      {/* Report Issue Modal Overlay */}
      {reportingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-display font-bold text-lg text-slate-100">
                  Report Document Issue
                </h3>
              </div>
              <button
                onClick={() => setReportingMaterial(null)}
                className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 font-sans">
              <div>
                <label className="text-[11px] font-mono uppercase text-slate-500 font-semibold block mb-1">
                  Selected Material
                </label>
                <input
                  type="text"
                  readOnly
                  value={reportingMaterial.title}
                  className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                  Issue Discrepancy Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Wrong PDF">Wrong PDF</option>
                  <option value="Corrupted File">Corrupted File</option>
                  <option value="Old Material">Old Material</option>
                  <option value="Wrong Department Mapping">Wrong Department Mapping</option>
                  <option value="Wrong Semester Mapping">Wrong Semester Mapping</option>
                  <option value="Duplicate Material">Duplicate Material</option>
                  <option value="Other Issue">Other Issue</option>
                  <option value="Broken Link">Broken Link</option>
                  <option value="Wrong Category">Wrong Category</option>
                  <option value="Poor Legibility">Poor Legibility</option>
                  <option value="Incorrect Content">Incorrect Content</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                  Detailed Discrepancy Description
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Clearly explain the mismatch or scan fault so faculty can verify and resolve this ticket quickly."
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  className="w-full p-3 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-rose-500/80"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReportingMaterial(null)}
                  className="px-4 py-2 rounded bg-slate-950 hover:bg-slate-800 text-xs text-slate-400 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition"
                >
                  Submit Issue Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
