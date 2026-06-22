import React, { useState, useEffect } from "react";
import { Search, Edit2, Trash2, Calendar, FileText, Download, X, Save, AlertTriangle, Eye, CheckCircle2, Folder, ArrowLeft, UploadCloud } from "lucide-react";
import { Material, ActiveScreen } from "../../types";
import { EmptyState } from "../../components/EmptyState";
import { DEPARTMENTS, MATERIAL_CATEGORIES } from "../../mockData";
import { getEffectiveDepartment, getEffectiveYear, getEffectiveSemester } from "../../lib/normalization";

interface ManageViewProps {
  materials: Material[];
  onDeleteMaterial: (id: string | string[]) => void;
  onUpdateMaterial: (updated: Material) => void;
  setScreen: (screen: ActiveScreen) => void;
  triggerPreview: (material: Material) => void;
  onUploadToSubject?: (subject: string) => void;
}

const ALL_EDIT_CATEGORIES = [
  "Lesson PDF",
  "Lesson PPT / Slides PDF",
  "Subject Syllabus Copy",
  "Lab Manual",
  "Notes / Handwritten Notes",
  "Mid Question Paper",
  "Semester Regular Question Paper",
  "Semester Supply Question Paper",
  "Model Question Paper"
];

export const ManageView: React.FC<ManageViewProps> = ({
  materials,
  onDeleteMaterial,
  onUpdateMaterial,
  setScreen,
  triggerPreview,
  onUploadToSubject,
}) => {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Filter States
  const [filterDept, setFilterDept] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterSem, setFilterSem] = useState("all");

  // Edit states
  const [editingMat, setEditingMat] = useState<Material | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editYear, setEditYear] = useState(1);
  const [editSem, setEditSem] = useState(1);
  const [editSubject, setEditSubject] = useState("");
  const [editUnit, setEditUnit] = useState("");

  // Delete states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  // Bulk action states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const filtered = materials.filter(
    (m) => {
      const matchCategory = ![
        "Mid Question Paper",
        "Semester Regular Question Paper",
        "Semester Supply Question Paper",
        "Model Question Paper"
      ].includes(m.category);

      const matchSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.fileName.toLowerCase().includes(search.toLowerCase()) ||
        (m.subject || "General").toLowerCase().includes(search.toLowerCase());

      const matchDept = filterDept === "all" || getEffectiveDepartment(m) === filterDept;
      const matchYear = filterYear === "all" || getEffectiveYear(m) === filterYear;
      const matchSem = filterSem === "all" || getEffectiveSemester(m) === filterSem;

      return matchCategory && matchSearch && matchDept && matchYear && matchSem;
    }
  );

  // Dynamic Grouping of Filtered Materials by Subject
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
    setEditUnit(mat.unit || "General");
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
      unit: editUnit.trim() === "" ? "General" : editUnit.trim(),
    });

    setEditingMat(null);
    setToast("MATERIAL METADATA SYNCED SUCCESSFULLY");
    setTimeout(() => setToast(""), 3000);
  };

  const confirmDelete = (id: string) => {
    onDeleteMaterial(id);
    setDeletingId(null);
    setToast("MATERIAL HARD DELETED FROM INVENTORY CATALOG INDEX");
    setTimeout(() => setToast(""), 3000);
  };

  const handleExecuteBulkDelete = () => {
    onDeleteMaterial(selectedIds);
    setSelectedIds([]);
    setShowBulkDeleteModal(false);
    setToast("SELECTED MATERIAL PURGES INITIATED");
    setTimeout(() => setToast(""), 3100);
  };

  return (
    <div className="space-y-6 relative max-w-7xl font-sans">
      {/* Toast Alert popup */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 p-4 rounded-xl bg-slate-900 border border-violet-400 text-xs font-mono font-bold text-cyber-violet box-glow-violet animate-bounce">
          <CheckCircle2 className="w-4.5 h-4.5" />
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search catalog inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:border-violet-500 text-slate-200"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="px-2 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                <option value="all">All Depts</option>
                {DEPARTMENTS.map(d => <option key={d} value={d.toLowerCase()}>{d} Department</option>)}
            </select>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="px-2 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                <option value="all">All Years</option>
                {['1', '2', '3', '4'].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filterSem} onChange={(e) => setFilterSem(e.target.value)} className="px-2 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                <option value="all">All Sems</option>
                {['1', '2'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>

        <button
          onClick={() => setScreen("FACULTY_UPLOAD")}
          className="px-5 py-2 rounded-lg bg-cyber-violet hover:bg-cyber-violet/85 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          Upload New Document
        </button>
      </div>

      {selectedSubject && selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 gap-3 text-xs font-mono font-bold animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyber-violet animate-pulse" />
            <span className="text-slate-300">
              SELECTED MATERIALS SUMMARY: <span className="text-cyber-violet font-extrabold text-sm">{selectedIds.length}</span> DOCUMENT(S)
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-slate-700 hover:text-white text-slate-400 font-sans font-bold text-[11px] cursor-pointer"
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
            {/* Header with back button and upload options */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-cyber-violet border border-violet-500/20">
                  <Folder className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-100">
                    {selectedSubject}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Managing {currentSubjectMaterials.length} materials
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {onUploadToSubject && (
                  <button
                    onClick={() => onUploadToSubject(selectedSubject)}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-cyber-violet hover:bg-cyber-violet/85 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-white" />
                    Upload to {selectedSubject}
                  </button>
                )}
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-950 text-slate-300 text-xs font-semibold border border-slate-800 hover:bg-slate-850 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-cyber-violet" />
                  Back to Subjects
                </button>
              </div>
            </div>

            {/* List Table of active subject materials */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-mono tracking-wider text-slate-400 uppercase bg-slate-950/70">
                    <th className="px-5 py-4 w-12 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-800 text-cyber-violet focus:ring-cyber-violet bg-slate-950 cursor-pointer h-4 w-4"
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
                    <th className="px-5 py-4">Course Document Info</th>
                    <th className="px-5 py-4">Department & Term</th>
                    <th className="px-5 py-4">Download Count</th>
                    <th className="px-5 py-4">File Name / Size</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/10">
                  {displayMaterials.map((mat) => (
                    <tr
                      key={mat.id}
                      className={`hover:bg-slate-900/30 transition-colors ${selectedIds.includes(mat.id) ? "bg-violet-500/5" : ""}`}
                    >
                      <td className="px-5 py-4.5 w-12 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-800 text-cyber-violet focus:ring-cyber-violet bg-slate-950 cursor-pointer h-4 w-4"
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
                        <div className="space-y-2 max-w-xs md:max-w-md">
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-violet-500/15 text-cyber-violet border border-violet-500/10">
                            {mat.category}
                          </span>
                          <h4 className="font-medium text-slate-200 block text-xs md:text-sm">
                            {mat.title}
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Uploaded by {mat.uploadedByName} on {new Date(mat.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </td>

                      {/* Targets */}
                      <td className="px-5 py-4.5 font-mono text-[11px] text-slate-300">
                        <p>DEP: <span className="text-cyber-violet font-bold">{mat.department}</span></p>
                        <p className="text-slate-500 mt-0.5">Year {mat.year} S{mat.semester}</p>
                        <p className="text-slate-400 text-[10px] mt-1">Sub: <span className="text-slate-300">{mat.subject || "General"}</span></p>
                        <p className="text-slate-500 text-[10px]">Unit: <span className="text-slate-400">{mat.unit || "General"}</span></p>
                      </td>

                      {/* Download stats */}
                      <td className="px-5 py-4.5 font-sans">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-cyber-violet">
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
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => triggerPreview(mat)}
                            className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                            title="Simulate Review Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => startEdit(mat)}
                            className="p-1.5 rounded bg-slate-950 border border-slate-850 text-sky-400 hover:bg-slate-900"
                            title="Edit Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(mat.id)}
                            className="p-1.5 rounded bg-rose-500/10 border border-transparent hover:border-rose-500/25 text-rose-400 hover:bg-rose-500/20"
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
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-violet-500/30 transition-all duration-200 cursor-pointer group box-glow-violet/5 flex flex-col justify-between relative"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center text-cyber-violet group-hover:bg-violet-500/20 transition-colors border border-violet-500/10 group-hover:border-violet-500/30">
                      <Folder className="w-6 h-6 text-cyber-violet" />
                    </div>
                    <div>
                      <h4 className="font-display font-medium text-base text-slate-100 group-hover:text-cyber-violet transition-colors truncate">
                        {subj}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {mats.length} {mats.length === 1 ? "material" : "materials"} total
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="truncate max-w-[80%]">
                      {unitsText}
                    </span>
                    <span className="text-cyber-violet opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      MANAGE &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <EmptyState type="no-uploads" onAction={() => setScreen("FACULTY_UPLOAD")} />
      )}

      {/* Edit Materials Modal Overlay */}
      {editingMat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-cyber-violet" />
                Edit Material Specifications
              </h3>
              <button
                onClick={() => setEditingMat(null)}
                className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-500 uppercase tracking-wide block mb-1">
                  Revision Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-500 uppercase block mb-1">
                    Category Tag
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-2 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none cursor-pointer font-sans"
                  >
                    {!ALL_EDIT_CATEGORIES.includes(editCategory) && editCategory && (
                      <option value={editCategory}>{editCategory} (Legacy/Other)</option>
                    )}
                    {ALL_EDIT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-500 uppercase block mb-1">
                    Department Link
                  </label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full px-2 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none cursor-pointer"
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
                  <label className="text-[11px] font-mono text-slate-500 uppercase block mb-1">
                    Undergrad Year
                  </label>
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4].map((y) => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-500 uppercase block mb-1">
                    Semester
                  </label>
                  <select
                    value={editSem}
                    onChange={(e) => setEditSem(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value={1}>Semester I</option>
                    <option value={2}>Semester II</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-500 uppercase block mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    placeholder="e.g. Java Programming"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-500 uppercase block mb-1">
                    Unit / Lesson
                  </label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    placeholder="e.g. Unit 1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMat(null)}
                  className="px-3.5 py-1.5 rounded bg-slate-950 hover:bg-slate-800 text-xs text-slate-400 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded bg-violet-600 hover:bg-violet-500 font-bold text-white text-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/15">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-100 mb-1">
              Confirm Material Purge
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Are you absolutely certain you want to soft/hard delete this academic file? This operation immediately clears search listings and is irreversible!
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-850 text-xs text-slate-400 font-semibold"
              >
                No, Keep File
              </button>
              <button
                onClick={() => confirmDelete(deletingId)}
                className="px-4 py-2 rounded bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition"
              >
                Yes, Purge Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal Overlay */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center font-sans">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/15">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-100 mb-1">
              Confirm Bulk Deletion
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="text-rose-400 font-bold">{selectedIds.length} selected materials</span>? This action is permanent, clears search indicators, and cannot be undone!
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-850 text-xs text-slate-400 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBulkDelete}
                className="px-4 py-2 rounded bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition cursor-pointer font-sans"
              >
                Yes, Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
