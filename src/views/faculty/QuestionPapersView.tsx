import React, { useState, useEffect } from "react";
import { Search, Edit2, Trash2, Calendar, FileText, Download, X, Save, AlertTriangle, Eye, CheckCircle2, Folder, ArrowLeft, UploadCloud } from "lucide-react";
import { Material, ActiveScreen } from "../../types";
import { EmptyState } from "../../components/EmptyState";
import { DEPARTMENTS } from "../../mockData";

interface QuestionPapersViewProps {
  materials: Material[];
  onDeleteMaterial: (id: string | string[]) => void;
  onUpdateMaterial: (updated: Material) => void;
  setScreen: (screen: ActiveScreen) => void;
  triggerPreview: (material: Material) => void;
  onUploadToSubject?: (subject: string, type?: "study_material" | "question_paper") => void;
}

const QUESTION_PAPER_CATEGORIES = [
  "Mid Question Paper",
  "Semester Regular Question Paper",
  "Semester Supply Question Paper",
  "Model Question Paper"
];

export const QuestionPapersView: React.FC<QuestionPapersViewProps> = ({
  materials,
  onDeleteMaterial,
  onUpdateMaterial,
  setScreen,
  triggerPreview,
  onUploadToSubject,
}) => {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Edit states
  const [editingMat, setEditingMat] = useState<Material | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editYear, setEditYear] = useState(1);
  const [editSem, setEditSem] = useState(1);
  const [editSubject, setEditSubject] = useState("");

  // Delete states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  // Bulk action states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Filter materials to ONLY question paper categories
  const filtered = materials.filter(
    (m) =>
      QUESTION_PAPER_CATEGORIES.includes(m.category) && (
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.fileName.toLowerCase().includes(search.toLowerCase()) ||
        (m.subject || "General").toLowerCase().includes(search.toLowerCase())
      )
  );

  // Dynamic Grouping of Filtered Question Papers by Subject
  const groups: { [subject: string]: Material[] } = {};
  filtered.forEach((mat) => {
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

  // Safeguard: Reset selectedSubject if it's no longer present after filtering
  if (selectedSubject && (!groups[selectedSubject] || groups[selectedSubject].length === 0)) {
    setSelectedSubject(null);
  }

  const currentSubjectMaterials = selectedSubject ? groups[selectedSubject] || [] : [];
  const displayMaterials = selectedSubject ? currentSubjectMaterials : filtered;

  useEffect(() => {
    setSelectedIds([]);
  }, [selectedSubject]);

  const startEdit = (mat: Material) => {
    setEditingMat(mat);
    setEditTitle(mat.title);
    setEditCategory(mat.category);
    setEditDept(mat.department);
    setEditYear(Number(mat.year));
    setEditSem(Number(mat.semester));
    setEditSubject(mat.subject || "General");
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMat) return;

    onUpdateMaterial({
      ...editingMat,
      title: editTitle,
      category: editCategory,
      department: editDept,
      year: editYear,
      semester: editSem,
      subject: editSubject.trim() === "" ? "General" : editSubject.trim(),
      unit: "General", // For question papers, unit is default to "General"
    });

    setEditingMat(null);
    setToast("QUESTION PAPER METADATA SYNCED SUCCESSFULLY");
    setTimeout(() => setToast(""), 3000);
  };

  const confirmDelete = (id: string) => {
    onDeleteMaterial(id);
    setDeletingId(null);
    setToast("QUESTION PAPER HARD DELETED FROM REPOSITORY");
    setTimeout(() => setToast(""), 3000);
  };

  const handleExecuteBulkDelete = () => {
    onDeleteMaterial(selectedIds);
    setSelectedIds([]);
    setShowBulkDeleteModal(false);
    setToast("SELECTED QUESTION PAPERS INITIATED FOR PURGE");
    setTimeout(() => setToast(""), 3100);
  };

  return (
    <div className="space-y-6 relative max-w-7xl font-sans text-xs sm:text-sm">
      {/* Toast Alert popup */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 p-4 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-mono font-bold text-cyber-cyan box-glow-cyan animate-bounce shadow-xl">
          <CheckCircle2 className="w-4.5 h-4.5" />
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search exam question papers, years, courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700/10 dark:border-slate-800 text-xs sm:text-sm focus:outline-none focus:border-cyan-500/50 text-slate-200 focus:ring-1 focus:ring-cyan-500/10"
          />
        </div>

        <button
          onClick={() => {
            if (onUploadToSubject) {
              onUploadToSubject("", "question_paper");
            } else {
              setScreen("FACULTY_UPLOAD");
            }
          }}
          className="px-5 py-2 rounded-xl bg-cyber-cyan hover:bg-cyber-cyan/90 text-slate-955 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/10 active:scale-95"
        >
          Upload Question Paper
        </button>
      </div>

      {selectedSubject && selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 gap-3 text-xs font-mono font-bold animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyber-cyan animate-pulse" />
            <span className="text-slate-300">
              SELECTED PAPERS SUMMARY: <span className="text-cyber-cyan font-extrabold text-sm">{selectedIds.length}</span> DOCUMENT(S)
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
               type="button"
               onClick={() => setSelectedIds([])}
               className="px-3 py-1.5 rounded-lg bg-slate-955 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-400 font-sans font-bold text-[11px] cursor-pointer"
            >
              Clear
            </button>
            <button
               type="button"
               onClick={() => setShowBulkDeleteModal(true)}
               className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-450 text-slate-950 font-sans font-black text-[11px] flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-md shadow-rose-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {filtered.length > 0 ? (
        selectedSubject ? (
          <div className="space-y-4">
            {/* Header with back button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-700/10 dark:border-slate-800 bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyber-cyan border border-cyan-500/20">
                  <Folder className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-medium text-base text-slate-100">
                    {selectedSubject}
                  </h3>
                  <p className="text-xs text-slate-450 mt-0.5">
                    Managing {currentSubjectMaterials.length} question papers
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {onUploadToSubject && (
                  <button
                    onClick={() => onUploadToSubject(selectedSubject, "question_paper")}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-slate-955 bg-cyber-cyan hover:bg-cyber-cyan/90 text-xs font-black rounded-xl transition cursor-pointer shadow-lg shadow-cyan-500/10"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Upload Paper to {selectedSubject}
                  </button>
                )}
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-955 text-slate-300 text-xs font-semibold border border-slate-800 hover:bg-slate-900 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-cyber-cyan" />
                  Back to Subjects
                </button>
              </div>
            </div>

            {/* List Table of active subject papers */}
            <div className="overflow-x-auto rounded-2xl border border-slate-700/10 dark:border-slate-800 bg-slate-955/40 shadow-xl">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-700/10 dark:border-slate-800 text-[10px] font-mono tracking-wider text-slate-400 uppercase bg-slate-955/70">
                    <th className="px-5 py-4 w-12 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-805 text-cyber-cyan focus:ring-cyber-cyan bg-slate-950 cursor-pointer h-4 w-4"
                        checked={displayMaterials.length > 0 && selectedIds.length === displayMaterials.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(displayMaterials.map(f => f.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-5 py-4">Paper Info</th>
                    <th className="px-5 py-4">Department & Term</th>
                    <th className="px-5 py-4">Download Count</th>
                    <th className="px-5 py-4">File Name / Size</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 dark:divide-slate-800 bg-slate-900/10">
                  {displayMaterials.map((mat) => (
                    <tr
                      key={mat.id}
                      className={`hover:bg-slate-900/30 transition-colors ${selectedIds.includes(mat.id) ? "bg-cyan-500/5 animate-in" : ""}`}
                    >
                      <td className="px-5 py-4.5 w-12 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-805 text-cyber-cyan focus:ring-cyber-cyan bg-slate-950 cursor-pointer h-4 w-4"
                          checked={selectedIds.includes(mat.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, mat.id]);
                            } else {
                              setSelectedIds((prev) => prev.filter(id => id !== mat.id));
                            }
                          }}
                        />
                      </td>
                      {/* Info */}
                      <td className="px-5 py-4.5">
                        <div className="space-y-1.5 max-w-xs md:max-w-md">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20">
                            {mat.category}
                          </span>
                          <h4 className="font-semibold text-slate-200 block text-xs sm:text-sm">
                            {mat.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Uploaded by {mat.uploadedByName || "Faculty Staff"} on {new Date(mat.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </td>

                      {/* Targets */}
                      <td className="px-5 py-4.5 font-mono text-[11px] text-slate-300">
                        <p>DEP: <span className="text-cyber-cyan font-bold">{mat.department}</span></p>
                        <p className="text-slate-500 mt-0.5">Year {mat.year} S{mat.semester}</p>
                        <p className="text-slate-400 text-[10px] mt-1">Sub: <span className="text-slate-300">{mat.subject || "General"}</span></p>
                      </td>

                      {/* Download stats */}
                      <td className="px-5 py-4.5 font-sans">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-cyber-cyan">
                          <Download className="w-3.5 h-3.5" />
                          {mat.downloadsCount} clicks
                        </span>
                      </td>

                      {/* File */}
                      <td className="px-5 py-4.5 font-mono text-xs text-slate-400">
                        <p className="truncate max-w-[120px]" title={mat.fileName}>
                          {mat.fileName}
                        </p>
                        <p className="text-[10px] text-slate-600 font-sans mt-0.5">{mat.fileSize}</p>
                      </td>

                      {/* Actions column */}
                      <td className="px-5 py-4.5 text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => triggerPreview(mat)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-805 text-slate-400 hover:text-white"
                            title="Simulate Review Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => startEdit(mat)}
                            className="p-1.5 rounded-lg bg-slate-955 border border-slate-805 text-cyan-400 hover:bg-slate-900"
                            title="Edit Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(mat.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-transparent hover:border-rose-500/25 text-rose-455 hover:bg-rose-500/20"
                            title="Hard Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Folder collection cards list */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
            {subjectsList.map((subj) => {
              const mats = groups[subj];
              const uniqueTypes = Array.from(new Set(mats.map(m => m.category.replace(" Question Paper", ""))));
              const typesText = uniqueTypes.length > 0 
                ? `Types: ${uniqueTypes.join(", ")}` 
                : "General Papers";

              return (
                <div
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className="p-6 rounded-xl border border-slate-750 dark:border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-cyan-500/30 transition-all duration-200 cursor-pointer group flex flex-col justify-between relative shadow-md"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyber-cyan group-hover:bg-cyan-500/20 transition-colors border border-cyan-500/10 group-hover:border-cyan-500/30">
                      <Folder className="w-6 h-6 text-cyber-cyan" />
                    </div>
                    <div>
                      <h4 className="font-display font-medium text-base text-slate-100 group-hover:text-cyber-cyan transition-colors truncate">
                        {subj}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {mats.length} {mats.length === 1 ? "question paper" : "question papers"} available
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="truncate max-w-[80%]">
                      {typesText}
                    </span>
                    <span className="text-cyber-cyan opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      MANAGE &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <EmptyState type="no-uploads" onAction={() => {
          if (onUploadToSubject) {
            onUploadToSubject("", "question_paper");
          } else {
            setScreen("FACULTY_UPLOAD");
          }
        }} />
      )}

      {/* Edit Materials Modal Overlay */}
      {editingMat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-cyber-cyan" />
                Edit Question Paper Specifications
              </h3>
              <button
                onClick={() => setEditingMat(null)}
                className="p-1 rounded bg-slate-950 hover:bg-slate-850 text-slate-455 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={saveEdit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="text-[11px] font-mono text-slate-450 uppercase tracking-wide block mb-1">
                  Revision Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-450 uppercase block mb-1">
                    Paper Type
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none cursor-pointer font-sans"
                  >
                    {QUESTION_PAPER_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-455 uppercase block mb-1">
                    Department Link
                  </label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept} Department
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-450 uppercase block mb-1">
                    Year Link
                  </label>
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4].map((y) => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-450 uppercase block mb-1">
                    Semester
                  </label>
                  <select
                    value={editSem}
                    onChange={(e) => setEditSem(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value={1}>Semester I</option>
                    <option value={2}>Semester II</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-450 uppercase block mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-955 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Java Programming"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 font-sans">
                <button
                  type="button"
                  onClick={() => setEditingMat(null)}
                  className="px-3.5 py-1.5 rounded bg-slate-950 hover:bg-slate-800 text-xs text-slate-400 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded bg-cyber-cyan text-slate-955 hover:bg-cyber-cyan/90 font-black text-xs cursor-pointer"
                >
                  Save Spec Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display font-black text-slate-100 text-sm tracking-wide uppercase">
                  CONFIRM HARD DELETION
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Are you absolutely sure you want to remove this question paper? This action is permanent.
                </p>
              </div>
              <div className="flex justify-center gap-2.5 pt-2 font-sans">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 text-xs font-semibold text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDelete(deletingId)}
                  className="px-5 py-2 rounded-lg bg-rose-500 hover:bg-rose-450 text-slate-955 text-xs font-black cursor-pointer shadow-md shadow-rose-500/20"
                >
                  Secure Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal Overlay */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display font-black text-slate-100 text-sm tracking-wide uppercase">
                  CONFIRM BULK ACTION
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Are you absolutely sure you want to delete <span className="text-rose-455 font-bold">{selectedIds.length}</span> question papers? This operation is permanent.
                </p>
              </div>
              <div className="flex justify-center gap-2.5 pt-2 font-sans">
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-850 text-xs font-semibold text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkDelete}
                  className="px-5 py-2 rounded-lg bg-rose-500 hover:bg-rose-450 text-slate-950 text-xs font-black cursor-pointer shadow-md shadow-rose-500/20"
                >
                  Bulk Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
