import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle, AlertCircle, Loader2, Info, ArrowLeft, FileText, Server } from "lucide-react";

interface UploadResponse {
  ok: boolean;
  storageProvider: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export function R2TestView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseJson, setResponseJson] = useState<any | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  
  const [deletePath, setDeletePath] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteResponse, setDeleteResponse] = useState<any | null>(null);
  const [healthResponse, setHealthResponse] = useState<any | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorStatus(null);
    setResponseJson(null);
    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedFile(null);
      return;
    }
    validateAndSetFile(files[0]);
  };

  const validateAndSetFile = (file: File) => {
    // If file type is not PDF
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setErrorStatus("Only PDF files are allowed.");
      setSelectedFile(null);
      return;
    }

    // If file size is greater than 25 MB
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      setErrorStatus("PDF must be 25 MB or smaller.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setErrorStatus(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    setErrorStatus(null);
    setResponseJson(null);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setErrorStatus("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setErrorStatus(null);
    setResponseJson(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/r2/test-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      setResponseJson(data);
    } catch (err: any) {
      console.error("R2 Upload error:", err);
      setErrorStatus(err.message || "An unexpected error occurred during the upload.");
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6 font-sans relative">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/15 via-slate-950 to-slate-950 pointer-events-none" />
      
      <div className="max-w-4xl w-full mx-auto space-y-6 relative z-10 py-8">
        
        {/* Navigation back block */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-white transition text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-400 font-bold">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            R2 DEV-MODE CONTEXT
          </div>
        </div>

        {/* Master Titles */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-display font-black uppercase text-slate-100 tracking-tight flex items-center gap-3">
            Cloudflare R2 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Test Upload</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl font-medium leading-relaxed">
            Temporary developer-only page for verifying R2 PDF upload. This does not affect real material uploads.
          </p>
        </div>

        {/* Main interactive segment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form and Dropper Grid Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-3">
                1 // Upload Sandbox
              </h2>

              <form onSubmit={handleUpload} className="space-y-4">
                {/* Drag and Drop Container */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[180px] ${
                    isDragActive
                      ? "border-cyan-400 bg-cyan-950/10"
                      : "border-slate-800 bg-slate-950 hover:bg-slate-900/50"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf,.pdf"
                    className="hidden"
                  />
                  
                  <div className={`p-3 rounded-full mb-3 border ${
                    selectedFile 
                      ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" 
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}>
                    {selectedFile ? <FileText className="w-8 h-8 animate-pulse" /> : <UploadCloud className="w-8 h-8" />}
                  </div>

                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-xs font-mono font-bold text-slate-200 max-w-xs truncate mx-auto">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">
                        Size: {formatBytes(selectedFile.size)}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-350">
                        Drag & Drop your PDF here, or <span className="text-cyan-400">browse folders</span>
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        Accepts only .pdf files up to 25 MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Validation and errors inside container */}
                {errorStatus && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/15 text-xs text-rose-400">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="font-mono">{errorStatus}</span>
                  </div>
                )}

                {/* Confirm Action Button */}
                <button
                  type="submit"
                  disabled={!selectedFile || loading}
                  className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg active:scale-[0.985] disabled:opacity-40 disabled:cursor-not-allowed bg-cyan-500 hover:bg-cyan-600 text-slate-950"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      Uploading Stream to R2 Bucket...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-slate-950" />
                      Dispatch Upload
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Results Segment */}
            {responseJson && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    2 // Upload Response Output
                  </h2>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2.5 py-0.5 rounded-full select-none">
                    SUCCESS
                  </span>
                </div>

                <div className="space-y-3 font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                      <span className="text-slate-500 text-[10px] uppercase">Storage Provider</span>
                      <p className="text-slate-200 font-bold text-xs">{responseJson.storageProvider}</p>
                    </div>
                    <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                      <span className="text-slate-500 text-[10px] uppercase">File Name</span>
                      <p className="text-slate-200 font-bold text-xs truncate" title={responseJson.fileName}>
                        {responseJson.fileName}
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                      <span className="text-slate-500 text-[10px] uppercase">Size on Bucket</span>
                      <p className="text-slate-200 font-bold text-xs">{formatBytes(responseJson.fileSize)}</p>
                    </div>
                    <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                      <span className="text-slate-500 text-[10px] uppercase">Mime-Type Type</span>
                      <p className="text-slate-200 font-bold text-xs">{responseJson.contentType}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Returned Storage Key Path</span>
                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl font-mono text-[11px] text-cyan-400 break-all select-all">
                      {responseJson.storagePath}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Full JSON Payload Response</span>
                    <pre className="text-[11px] font-mono bg-slate-950 p-4 rounded-xl text-slate-300 overflow-x-auto border border-slate-850 max-h-[220px]">
                      {JSON.stringify(responseJson, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Safety & Developer Info Column */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                Information Guard
              </h3>
              
              <div className="space-y-3.5 text-xs text-slate-450 font-medium leading-relaxed font-sans">
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0 mt-1.5" />
                  <p>
                    The test document uploads directly into <strong className="text-slate-200">test-uploads/</strong> root directory of the Cloudflare R2 bucket.
                  </p>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0 mt-1.5" />
                  <p>
                    This utility <strong className="text-slate-200">does not</strong> log, persist, or inject any entries into Firestore users/materials/analytics databases.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0 mt-1.5" />
                  <p>
                    The real-world upload, search, and download features rely on <strong className="text-slate-200 font-bold text-emerald-400">Supabase Storage</strong> and remain fully operational.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0 mt-1.5" />
                  <p>
                    Credentials and endpoint tokens are loaded securely by the Express server backplane. They are never transmitted or exposed to the client-side bundle.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick API Health Verification */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                Backend API Health
              </h3>
              <button
                type="button"
                disabled={healthLoading}
                className="w-full text-center text-xs font-mono font-bold py-2 px-3 border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 hover:text-white rounded-lg transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={async () => {
                  setHealthLoading(true);
                  setHealthResponse(null);
                  try {
                    const healthResp = await fetch("/api/r2/health");
                    const healthData = await healthResp.json();
                    setHealthResponse(healthData);
                  } catch (hErr: any) {
                    setHealthResponse({ ok: false, error: hErr.message });
                  } finally {
                    setHealthLoading(false);
                  }
                }}
              >
                {healthLoading ? "Pinging..." : "Perform R2 Ping Test"}
              </button>

              {healthResponse && (
                <div className="mt-2 text-left">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Health Status</span>
                  <pre className={`text-[10px] font-mono p-2.5 rounded-lg overflow-x-auto border ${
                    healthResponse.ok 
                      ? "bg-emerald-950/25 border-emerald-500/20 text-emerald-400" 
                      : "bg-rose-950/25 border-rose-500/20 text-rose-450"
                  }`}>
                    {JSON.stringify(healthResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Quick Developer-Only Delete Test Utility */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Developer Object Delete Test
              </h3>
              
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Input any R2 storagePath that begins with <code className="text-slate-200">test-uploads/</code> or <code className="text-slate-200">materials/</code> to test object deletion.
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="e.g. test-uploads/my-sample-file.pdf"
                  value={deletePath}
                  onChange={(e) => {
                    setDeletePath(e.target.value);
                    setDeleteResponse(null);
                  }}
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                />

                <button
                  type="button"
                  disabled={deleteLoading || !deletePath.trim()}
                  className="w-full text-center text-xs font-mono font-bold py-2 px-3 bg-rose-950 hover:bg-rose-900/20 border border-rose-900/30 hover:border-rose-500/30 text-rose-400 hover:text-rose-200 rounded-lg transition duration-200 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                  onClick={async () => {
                    setDeleteLoading(true);
                    setDeleteResponse(null);
                    try {
                      const res = await fetch("/api/r2/delete-object", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ storagePath: deletePath.trim() })
                      });
                      const data = await res.json();
                      setDeleteResponse(data);
                    } catch (err: any) {
                      setDeleteResponse({ ok: false, error: err.message || "Failed to contact deletion endpoint" });
                    } finally {
                      setDeleteLoading(false);
                    }
                  }}
                >
                  {deleteLoading ? "Sending Delete Command..." : "Delete R2 Object"}
                </button>

                {deleteResponse && (
                  <div className="mt-3">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Response JSON</span>
                    <pre className="text-[10px] font-mono bg-slate-950 p-2.5 rounded-lg text-slate-350 overflow-x-auto border border-slate-850 max-h-[140px] whitespace-pre-wrap select-all">
                      {JSON.stringify(deleteResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
