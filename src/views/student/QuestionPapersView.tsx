import React, { useState } from "react";
import { Search, SlidersHorizontal, DownloadCloud, Eye, AlertTriangle, X, Check, FileSearch, Loader2, Folder, ArrowLeft } from "lucide-react";
import { Material, IssueReport, StudentProfile } from "../../types";
import { DEPARTMENTS } from "../../mockData";
import { getEffectiveDepartment, getEffectiveSemester } from "../../lib/normalization";

interface QuestionPapersViewProps {
  user: StudentProfile;
  materials: Material[];
  onDownload: (material: Material) => void;
  triggerPreview: (material: Material) => void;
  onSubmitReport: (report: Omit<IssueReport, "id" | "studentName" | "studentRoll" | "reportDate" | "status">) => void;
}

const QUESTION_PAPER_CATEGORIES = [
  "Mid Question Paper",
  "Semester Regular Question Paper",
  "Semester Supply Question Paper",
  "Model Question Paper"
];

export const QuestionPapersView: React.FC<QuestionPapersViewProps> = ({
  user,
  materials,
  onDownload,
  triggerPreview,
  onSubmitReport,
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedSem, setSelectedSem] = useState("All");
  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Issue reporting panel state
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
      console.error("Direct download failed in Question Papers view:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Resolve student parameters
  const studentDeptNorm = getEffectiveDepartment({ department: user.department }) || "";
  const studentSemNorm = Number(getEffectiveSemester({ semester: user.currentSemester })) || 1;

  // Only material where category is one of the Question Paper categories AND matches backend student department & semester policy
  const baseQuestionPapers = materials.filter((m) => {
    const isQP = QUESTION_PAPER_CATEGORIES.includes(m.category);
    const matDeptNorm = getEffectiveDepartment(m) || "";
    const matSemNorm = Number(getEffectiveSemester(m)) || 1;
    return (
      isQP &&
      m.status === "active" &&
      matDeptNorm === studentDeptNorm &&
      matSemNorm <= studentSemNorm &&
      matSemNorm >= 1 &&
      matSemNorm <= 8
    );
  });

  const filteredQuestionPapers = baseQuestionPapers.filter((m) => {
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

  // Dynamic Grouping
  const groups: { [subject: string]: Material[] } = {};
  filteredQuestionPapers.forEach((mat) => {
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

    setToastMessage("TICKET FILED // DISCREPANCY RECORDED FOR REVIEW");
    setTimeout(() => setToastMessage(""), 4000);
  };

  const departments = ["All", user.department];
  const years = ["All", "1", "2", "3", "4"];
  const semesters = ["All", ...Array.from({ length: studentSemNorm }, (_, i) => String(i + 1))];
  const categories = ["All", ...QUESTION_PAPER_CATEGORIES];

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
            Question Papers Navigator Filters
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          {/* Search bar */}
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Search Keyword
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search papers by keyword or subject..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedSubject(null);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition font-sans"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="sm:col-span-1 lg:col-span-2">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedSubject(null);
              }}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer font-sans"
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
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedSubject(null);
              }}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer font-sans"
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
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Semester
            </label>
            <select
              value={selectedSem}
              onChange={(e) => {
                setSelectedSem(e.target.value);
                setSelectedSubject(null);
              }}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer font-sans"
            >
              {semesters.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Semesters" : `Semester ${s}`}
                </option>
              ))}
            </select>
          </div>

          {/* Paper Type Filter */}
          <div className="sm:col-span-1 lg:col-span-2">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Paper Type
            </label>
            <select
              value={selectedCat}
              onChange={(e) => {
                setSelectedCat(e.target.value);
                setSelectedSubject(null);
              }}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer font-sans"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Papers" : c.replace(" Question Paper", "")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {filteredQuestionPapers.length > 0 ? (
        isViewingSubject ? (
          <div className="space-y-4">
            {/* Header with back button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyber-cyan border border-cyan-500/20">
                  <Folder className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-100">
                    {selectedSubject}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Showing {currentSubjectMaterials.length} question papers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubject(null)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-950 text-slate-300 text-xs font-semibold border border-slate-800 hover:bg-slate-850 hover:text-white transition cursor-pointer self-start sm:self-auto"
              >
                <ArrowLeft className="w-4 h-4 text-cyber-cyan" />
                Back to Subjects
              </button>
            </div>

            {/* Cards for selected subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentSubjectMaterials.map((mat) => (
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
                        TYPE: <span className="text-cyber-cyan font-bold truncate">{mat.category.replace(" Question Paper", "")}</span>
                      </div>
                      <div className="col-span-2 border-t border-slate-900 pt-1 mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400">
                        <div>
                          SUBJECT: <span className="text-slate-300 font-semibold">{mat.subject || "General"}</span>
                        </div>
                        {mat.unit && mat.unit.toLowerCase() !== "general" && (
                          <div>
                            UNIT/LESSON: <span className="text-slate-300 font-semibold">{mat.unit}</span>
                          </div>
                        )}
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
          </div>
        ) : (
          /* Render grid of subject folder cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectsList.map((subj) => {
              const mats = groups[subj];
              const uniqueCategories = Array.from(new Set(mats.map(m => m.category)))
                .map(cat => cat.replace(" Question Paper", ""));
              const summaryText = uniqueCategories.length > 0
                ? `Types: ${uniqueCategories.join(", ")}`
                : "Papers Available";

              return (
                <div
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-cyan-500/30 transition-all duration-200 cursor-pointer group box-glow-cyan/5 flex flex-col justify-between relative"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyber-cyan group-hover:bg-cyan-500/20 transition-colors border border-cyan-500/10 group-hover:border-cyan-500/30">
                      <Folder className="w-6 h-6 text-cyber-cyan" />
                    </div>
                    <div>
                      <h4 className="font-display font-medium text-base text-slate-100 group-hover:text-cyber-cyan transition-colors truncate">
                        {subj}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {mats.length} {mats.length === 1 ? "document" : "documents"} total
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="truncate max-w-[80%]" title={summaryText}>
                      {summaryText}
                    </span>
                    <span className="text-cyber-cyan opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      OPEN &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="text-center py-12 p-8 rounded-2xl border border-slate-800 bg-slate-900/10">
          <FileSearch className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-bounce" />
          <p className="text-sm text-slate-400 font-medium font-mono uppercase tracking-wide">
            No question papers found for selected filters.
          </p>
        </div>
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
