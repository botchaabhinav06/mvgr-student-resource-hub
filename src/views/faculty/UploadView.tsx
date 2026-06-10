import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, File, AlertCircle, Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { Material, FacultyProfile, ActiveScreen } from "../../types";
import { DEPARTMENTS } from "../../mockData";
import { supabase } from "../../lib/supabaseClient";

interface UploadViewProps {
  user: FacultyProfile;
  onUploadSuccess: (material: Omit<Material, "uploadedBy" | "uploadedByName" | "uploadDate" | "downloadsCount"> & { id: string; storagePath: string; storageProvider: string }) => void;
  setScreen: (screen: ActiveScreen) => void;
  prefilledSubject?: string;
  prefilledUploadType?: "study_material" | "question_paper";
}

const STUDY_MATERIAL_CATEGORIES = [
  "Lesson PDF",
  "Lesson PPT / Slides PDF",
  "Subject Syllabus Copy",
  "Lab Manual",
  "Notes / Handwritten Notes"
];

const QUESTION_PAPER_CATEGORIES = [
  "Mid Question Paper",
  "Semester Regular Question Paper",
  "Semester Supply Question Paper",
  "Model Question Paper"
];

export const UploadView: React.FC<UploadViewProps> = ({
  user,
  onUploadSuccess,
  setScreen,
  prefilledSubject,
  prefilledUploadType,
}) => {
  // Form coordinates
  const [title, setTitle] = useState("");
  const [uploadType, setUploadType] = useState<"study_material" | "question_paper">(prefilledUploadType || "study_material");
  const [category, setCategory] = useState<string>(
    (prefilledUploadType || "study_material") === "study_material"
      ? STUDY_MATERIAL_CATEGORIES[0]
      : QUESTION_PAPER_CATEGORIES[0]
  );
  const [department, setDepartment] = useState(user.department); // default to user dept
  const [year, setYear] = useState(3);
  const [semester, setSemester] = useState(2);
  const [subject, setSubject] = useState(prefilledSubject || "");
  const [unit, setUnit] = useState("");

  const handleUploadTypeChange = (type: "study_material" | "question_paper") => {
    setUploadType(type);
    if (type === "study_material") {
      setCategory(STUDY_MATERIAL_CATEGORIES[0]);
    } else {
      setCategory(QUESTION_PAPER_CATEGORIES[0]);
    }
  };

  useEffect(() => {
    if (prefilledSubject) {
      setSubject(prefilledSubject);
    }
    if (prefilledUploadType) {
      setUploadType(prefilledUploadType);
      setCategory(
        prefilledUploadType === "study_material"
          ? STUDY_MATERIAL_CATEGORIES[0]
          : QUESTION_PAPER_CATEGORIES[0]
      );
    }
  }, [prefilledSubject, prefilledUploadType]);
  
  // Real PDF State coordinates
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [simulatedFile, setSimulatedFile] = useState<{ name: string; size: string } | null>(null);

  // Error/Success / Loading states
  const [errorText, setErrorText] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateDragClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Strict PDF verification
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setErrorText("INVALID FILE TYPE // ONLY PDF ATTACHMENTS ARE SANCTIONED BY SYSTEM RULES.");
        setRawFile(null);
        setSimulatedFile(null);
        return;
      }

      setErrorText("");
      setRawFile(file);
      const mbSize = (file.size / (1024 * 1024)).toFixed(1);
      setSimulatedFile({
        name: file.name,
        size: `${mbSize} MB`,
      });
      if (title === "") {
        // Strip excess extension and replace dashes/underscores with spaces
        setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
    }
  };

  const handleSimulatedDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (uploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      // Strict PDF verification
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setErrorText("INVALID FILE TYPE // ONLY PDF ATTACHMENTS ARE SANCTIONED BY SYSTEM RULES.");
        setRawFile(null);
        setSimulatedFile(null);
        return;
      }

      setErrorText("");
      setRawFile(file);
      const mbSize = (file.size / (1024 * 1024)).toFixed(1);
      setSimulatedFile({
        name: file.name,
        size: `${mbSize} MB`,
      });
      if (title === "") {
        setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawFile) {
      setErrorText("MISSING FILE RESOURCE // DRAG AND DROP TARGET PDF");
      return;
    }
    setErrorText("");
    setUploading(true);

    try {
      // 1. Generate new ID
      const materialId = `MAT-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // 2. Generate path: materials/{department}/{year}/{semester}/{materialId}/{timestamp}_{safeFileName}
      const safeFileName = rawFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const timestamp = Date.now();
      const storagePath = `materials/${department}/${year}/${semester}/${materialId}/${timestamp}_${safeFileName}`;

      // 3. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("materials-pdfs")
        .upload(storagePath, rawFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: "application/pdf",
        });

      if (uploadError) {
        throw new Error(uploadError.message || "Could not complete Supabase file write.");
      }

      // 4. Resolve the public URL from the bucket
      const { data: { publicUrl } } = supabase.storage
        .from("materials-pdfs")
        .getPublicUrl(storagePath);

      // 5. Fire parent context success event
      onUploadSuccess({
        id: materialId,
        title,
        category,
        department,
        year,
        semester,
        fileName: rawFile.name,
        fileSize: simulatedFile ? simulatedFile.size : "1.5 MB",
        status: "active",
        previewUrl: publicUrl,
        storagePath: storagePath,
        storageProvider: "supabase",
        subject: subject.trim() === "" ? "General" : subject.trim(),
        unit: uploadType === "question_paper" ? "General" : (unit.trim() === "" ? "General" : unit.trim()),
      });

      setSuccessToast("RESOURCE SECURED // MATERIAL COMMITTED TO CLOUD ENVELOPE");
      setTimeout(() => {
        setSuccessToast("");
        // Redirect straight to catalog view manager
        setScreen("FACULTY_MANAGE");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setErrorText(`UPLOAD PIPELINE FAILURE // ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl relative">
      {/* Toast popup */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 p-4 rounded-xl bg-slate-900 border border-violet-400 text-xs font-mono font-bold text-cyber-violet box-glow-violet animate-bounce">
          <CheckCircle className="w-4.5 h-4.5 text-cyber-violet" />
          {successToast}
        </div>
      )}

      {errorText && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs font-mono text-rose-400">
          <AlertCircle className="w-4 h-4" />
          {errorText}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl cyber-glass border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 pb-3 mb-2 border-b border-lite bg-slate-900 border-slate-800">
          <UploadCloud className="w-5 h-5 text-cyber-violet" />
          <h3 className="font-display font-bold text-sm text-slate-200 tracking-wide uppercase">
            Document Repository Upload Form
          </h3>
        </div>

        {/* Dynamic Drag-and-Drop Area Component */}
        <div>
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide block mb-2">
            Upload PDF Document File
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleSimulatedDrop}
            onClick={simulateDragClick}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              simulatedFile
                ? "bg-violet-500/5 border-violet-500/40"
                : "border-slate-800 hover:border-violet-500/30 bg-slate-950/40"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {simulatedFile ? (
              <div className="space-y-2 animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-lg bg-violet-500/15 text-cyber-violet flex items-center justify-center mx-auto border border-violet-500/20">
                  <File className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100 font-mono truncate max-w-sm">
                    {simulatedFile.name}
                  </p>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Verified Attachment // Size: <span className="text-cyber-violet font-bold font-mono">{simulatedFile.size}</span>
                  </p>
                </div>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    setRawFile(null);
                    setSimulatedFile(null);
                  }}
                  className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-rose-400 hover:text-white disabled:opacity-50"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-3 font-sans">
                <div className="w-12 h-12 rounded-lg bg-slate-900 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">
                    Click to browse files or drag PDF documents here
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports high-resolution PDF study material textbooks up to 32 MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meta Info Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          <div className="md:col-span-2">
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5 animate-pulse">
              Upload Type / Resource Category
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <button
                type="button"
                onClick={() => handleUploadTypeChange("study_material")}
                className={`py-2.5 text-xs font-mono font-bold tracking-wider uppercase rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  uploadType === "study_material"
                    ? "bg-violet-600/90 text-white shadow-md shadow-violet-600/20 border border-violet-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                Study Material
              </button>
              <button
                type="button"
                onClick={() => handleUploadTypeChange("question_paper")}
                className={`py-2.5 text-xs font-mono font-bold tracking-wider uppercase rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  uploadType === "question_paper"
                    ? "bg-violet-600/90 text-white shadow-md shadow-violet-600/20 border border-violet-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                Question Paper
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
              {uploadType === "study_material" ? "Material Title Name" : "Paper Title"}
            </label>
            <input
              type="text"
              required
              disabled={uploading}
              placeholder={uploadType === "study_material" ? "e.g., Computer Organization Cache Memory Mapping" : "e.g., DBMS Mid 1 Regular Nov 2025"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
              {uploadType === "study_material" ? "Academic Type Category" : "Paper Type"}
            </label>
            <select
              value={category}
              disabled={uploading}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer font-sans"
            >
              {(uploadType === "study_material" ? STUDY_MATERIAL_CATEGORIES : QUESTION_PAPER_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
              {uploadType === "study_material" ? "Target College Department" : "Department"}
            </label>
            <select
              value={department}
              disabled={uploading}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept} Department
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                {uploadType === "study_material" ? "B.Tech Year" : "Year"}
              </label>
              <select
                value={year}
                disabled={uploading}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                {[1, 2, 3, 4].map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr} Guide
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                {uploadType === "study_material" ? "Semester term" : "Semester"}
              </label>
              <select
                value={semester}
                disabled={uploading}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value={1}>Semester I</option>
                <option value={2}>Semester II</option>
              </select>
            </div>
          </div>

          <div className={uploadType === "study_material" ? "" : "md:col-span-2"}>
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5" id="subject-name-label">
              Subject Name
            </label>
            <input
              type="text"
              disabled={uploading}
              placeholder="Enter subject name, e.g., Java Programming"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
              id="subject-name-input"
            />
          </div>

          {uploadType === "study_material" && (
            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5" id="unit-lesson-label">
                Unit / Lesson
              </label>
              <input
                type="text"
                disabled={uploading}
                placeholder="Enter unit or lesson, e.g., Unit 1 or Lesson 2"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                id="unit-lesson-input"
              />
            </div>
          )}
        </div>

        {/* Security / Quality Guidelines Checklist */}
        <div className="p-4 rounded-xl bg-violet-950/10 border border-violet-500/15 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyber-violet font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            ACADEMIC INTEGRITY INSTRUCTIONS CHECK
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Please ensure uploaded documents belong strictly to registered regulatory curriculum guides or official lecture scripts. Every upload preserves an internal audit hash mapping of creator identity employee roll codes.
          </p>
        </div>

        {/* Button Submit */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyber-violet text-white text-xs font-bold hover:bg-cyber-violet/85 shadow-lg shadow-violet-500/10 cursor-pointer active:scale-95 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Vaulting PDF Content...
              </>
            ) : (
              "Commit Upload"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
