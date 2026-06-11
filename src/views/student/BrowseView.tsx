import React, { useState } from "react";
import { Search, SlidersHorizontal, DownloadCloud, Eye, AlertTriangle, X, Check, FileSearch, Loader2, Folder, ArrowLeft } from "lucide-react";
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
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

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
    setSelectedSubject(null);
  };

  // Filter logic: Exclude Question Papers from Study Materials Browse view
  const studyMaterialsOnly = materials.filter(
    (m) =>
      !["Mid Question Paper", "Semester Regular Question Paper", "Semester Supply Question Paper", "Model Question Paper"].includes(m.category)
  );

  const filteredMaterials = studyMaterialsOnly.filter((m) => {
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.subject || "General").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.unit || "General").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "All" || m.department === selectedDept;
    const matchesYear = selectedYear === "All" || m.year.toString() === selectedYear;
    const matchesSem = selectedSem === "All" || m.semester.toString() === selectedSem;
    const matchesCat = selectedCat === "All" || m.category === selectedCat;

    return matchesSearch && matchesDept && matchesYear && matchesSem && matchesCat;
  });

  // Dynamic Grouping of Filtered Materials by Subject
  const groups: { [subject: string]: Material[] } = {};
  filteredMaterials.forEach((mat) => {
    const subName = mat.subject?.trim() || "General";
    if (!groups[subName]) {
      groups[subName] = [];
    }
    groups[subName].push(mat);
  });

  const subjectsList = Object.keys(groups).sort((a, b) => {
    if (a === "General") return 1;
    if (b === "General") return -1;
    return a.localeCompare(b);
  });

  const currentSubjectMaterials = selectedSubject ? groups[selectedSubject] || [] : [];
  const isViewingSubject = selectedSubject !== null && currentSubjectMaterials.length > 0;

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
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 p-4 rounded-xl bg-theme-teal-action text-white text-xs font-mono font-bold shadow-lg border border-theme-teal-action/20 animate-bounce">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Filter and Search Action Console Panel */}
      <div className="p-5 rounded-2xl cyber-glass border border-slate-705/10 dark:border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-705/10 dark:border-slate-800">
          <SlidersHorizontal className="w-4 h-4 text-theme-teal-action" />
          <h3 className="font-display font-bold text-sm text-slate-100 tracking-wide uppercase">
            Browse Materials Filters
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          {/* Search bar */}
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 block mb-1">
              Search Keyword
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by keywords or file tag..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedSubject(null);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-theme-input-bg dark:bg-slate-950 border border-theme-input-border dark:border-slate-800 text-sm text-slate-100 dark:text-slate-200 placeholder-theme-input-placeholder focus:outline-none focus:border-theme-teal-action focus:ring-1 focus:ring-theme-teal-action/30 transition font-sans"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="sm:col-span-1 lg:col-span-2">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 block mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedSubject(null);
              }}
              className="w-full px-3 py-2 rounded-lg bg-theme-input-bg dark:bg-slate-950 border border-theme-input-border dark:border-slate-800 text-sm text-slate-100 dark:text-slate-300 focus:outline-none focus:border-theme-teal-action focus:ring-1 focus:ring-theme-teal-action/30 cursor-pointer font-sans"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All Departments" : `${d} Department`}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="sm:col-span-1 lg:col-span-2">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 block mb-1">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedSubject(null);
              }}
              className="w-full px-3 py-2 rounded-lg bg-theme-input-bg dark:bg-slate-950 border border-theme-input-border dark:border-slate-800 text-sm text-slate-100 dark:text-slate-300 focus:outline-none focus:border-theme-teal-action focus:ring-1 focus:ring-theme-teal-action/30 cursor-pointer font-sans"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y === "All" ? "All Years" : `Year ${y}`}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="sm:col-span-1 lg:col-span-2">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 block mb-1">
              Semester
            </label>
            <select
              value={selectedSem}
              onChange={(e) => {
                setSelectedSem(e.target.value);
                setSelectedSubject(null);
              }}
              className="w-full px-3 py-2 rounded-lg bg-theme-input-bg dark:bg-slate-950 border border-theme-input-border dark:border-slate-800 text-sm text-slate-100 dark:text-slate-300 focus:outline-none focus:border-theme-teal-action focus:ring-1 focus:ring-theme-teal-action/30 cursor-pointer font-sans"
            >
              {semesters.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Semesters" : `Semester ${s}`}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-1 lg:col-span-2">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 block mb-1">
              Category
            </label>
            <select
              value={selectedCat}
              onChange={(e) => {
                setSelectedCat(e.target.value);
                setSelectedSubject(null);
              }}
              className="w-full px-3 py-2 rounded-lg bg-theme-input-bg dark:bg-slate-950 border border-theme-input-border dark:border-slate-800 text-sm text-slate-100 dark:text-slate-300 focus:outline-none focus:border-theme-teal-action focus:ring-1 focus:ring-theme-teal-action/30 cursor-pointer font-sans"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {filteredMaterials.length > 0 ? (
        isViewingSubject ? (
          <div className="space-y-4">
            {/* Header with back button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-705/10 dark:border-slate-800 bg-slate-900/30 dark:bg-slate-900/40 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-theme-teal-action/10 flex items-center justify-center text-theme-teal-action border border-theme-teal-action/20">
                  <Folder className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-100">
                    {selectedSubject}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                    Showing <span className="font-semibold text-slate-200 dark:text-slate-300">{currentSubjectMaterials.length}</span> materials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubject(null)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/5 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-705/10 dark:border-slate-800 hover:bg-slate-900/10 dark:hover:bg-slate-850 hover:text-slate-950 dark:hover:text-white transition cursor-pointer self-start sm:self-auto shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 text-theme-teal-action" />
                Back to Subjects
              </button>
            </div>

            {/* Cards for selected subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentSubjectMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="cyber-glass p-5 rounded-xl border border-slate-705/10 dark:border-slate-850 bg-slate-900/30 dark:bg-slate-900/50 hover:bg-slate-900/40 dark:hover:bg-slate-900/80 transition-all duration-200 flex flex-col justify-between group shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-theme-teal-action/10 text-theme-teal-action border border-theme-teal-action/15">
                        {mat.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {mat.fileSize}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-display font-medium text-slate-100 hover:text-theme-teal-action transition-colors leading-snug">
                        {mat.title}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-400 font-sans">
                        By {mat.uploadedByName} ({mat.department} Dept)
                      </p>
                    </div>

                    {/* Meta details tag */}
                    <div className="p-2.5 rounded-lg bg-slate-900/5 dark:bg-slate-950/70 border border-slate-750/10 dark:border-slate-800/80 grid grid-cols-2 gap-y-1 text-[11px] font-mono text-slate-550 dark:text-slate-400/85">
                      <div>
                        YEAR: <span className="text-slate-700 dark:text-slate-300 font-semibold">{mat.year}</span>
                      </div>
                      <div>
                        SEM: <span className="text-slate-700 dark:text-slate-300 font-semibold">Semester {mat.semester}</span>
                      </div>
                      <div>
                        DATE: <span className="text-slate-500 dark:text-slate-400">{new Date(mat.uploadDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        CAT: <span className="text-theme-teal-action font-semibold truncate">{mat.category}</span>
                      </div>
                      <div className="col-span-2 border-t border-slate-700/10 dark:border-slate-900/60 pt-1.5 mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                        <div>
                          SUBJECT: <span className="text-slate-600 dark:text-slate-300 font-semibold">{mat.subject || "General"}</span>
                        </div>
                        <div>
                          UNIT: <span className="text-slate-600 dark:text-slate-300 font-semibold">{mat.unit || "General"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action grid bottom */}
                  <div className="grid grid-cols-3 gap-2 mt-5">
                    <button
                      onClick={() => triggerPreview(mat)}
                      className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-slate-900/10 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-705/10 dark:border-slate-800 hover:bg-slate-900/20 dark:hover:bg-slate-850 hover:text-slate-950 dark:hover:text-white transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>

                    <button
                      onClick={() => handleDownloadClick(mat)}
                      disabled={downloadingId === mat.id}
                      className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-theme-teal-action disabled:opacity-55 disabled:bg-theme-teal-action/50 text-white text-xs font-semibold hover:bg-theme-teal-action/90 shadow-sm border border-theme-teal-action/10 transition cursor-pointer disabled:cursor-not-allowed"
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
                      className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold hover:text-rose-900 dark:hover:text-rose-200 transition cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Report Issue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Render grid of subject folder cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectsList.map((subj) => {
              const mats = groups[subj];
              const uniqueUnits = Array.from(new Set(mats.map(m => m.unit?.trim() || "General")))
                .filter(u => u !== "" && u.toLowerCase() !== "general");
              const unitsText = uniqueUnits.length > 0 
                ? `Units: ${uniqueUnits.join(", ")}` 
                : "General Unit";

              return (
                <div
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className="cyber-glass p-5 rounded-xl border border-slate-705/10 dark:border-slate-800 bg-slate-900/30 dark:bg-slate-900/50 hover:bg-slate-900/40 dark:hover:bg-slate-900/80 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative shadow-md hover:shadow-lg hover:translate-y-[-2px]"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-theme-teal-action/10 flex items-center justify-center text-theme-teal-action group-hover:bg-theme-teal-action/20 transition-colors border border-theme-teal-action/10 group-hover:border-theme-teal-action/30">
                      <Folder className="w-6 h-6 text-theme-teal-action" />
                    </div>
                    <div>
                      <h4 className="font-display font-medium text-base text-slate-100 group-hover:text-theme-teal-action transition-colors truncate">
                        {subj}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {mats.length} {mats.length === 1 ? "material" : "materials"} total
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/10 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="truncate max-w-[80%]">
                      {unitsText}
                    </span>
                    <span className="text-theme-teal-action opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      OPEN &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <EmptyState type="no-materials" onAction={resetFilters} />
      )}

      {/* Report Issue Modal Overlay */}
      {reportingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-705/15 dark:border-slate-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-rose-500/10 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
                <h3 className="font-display font-medium text-lg text-slate-100">
                  Report Document Issue
                </h3>
              </div>
              <button
                onClick={() => setReportingMaterial(null)}
                className="p-1 rounded bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 font-sans">
              <div>
                <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                  Selected Material
                </label>
                <input
                  type="text"
                  readOnly
                  value={reportingMaterial.title}
                  className="w-full px-3 py-2 rounded bg-theme-input-bg dark:bg-slate-950 border border-theme-input-border dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                  Issue Discrepancy Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded bg-theme-input-bg dark:bg-slate-950 border border-theme-input-border dark:border-slate-800 text-xs text-slate-100 dark:text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
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
                  className="w-full p-3 rounded bg-theme-input-bg dark:bg-slate-950 border border-theme-input-border dark:border-slate-800 text-xs text-slate-100 dark:text-slate-300 placeholder-theme-input-placeholder focus:outline-none focus:border-rose-500/80"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-705/10 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReportingMaterial(null)}
                  className="px-4 py-2 rounded bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-400 font-semibold border border-slate-200 dark:border-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-rose-600 dark:bg-rose-500 text-white text-xs font-bold hover:bg-rose-750 dark:hover:bg-rose-600 transition"
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
