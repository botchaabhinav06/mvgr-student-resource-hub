import React, { useState } from "react";
import { X, Download, AlertCircle, ExternalLink, FileText, Loader2 } from "lucide-react";
import { Material } from "../types";
import { auth } from "../firebase/firebaseConfig";
import { apiUrl } from "../lib/apiBase";

interface PDFPreviewModalProps {
  material: Material | null;
  onClose: () => void;
  onDownload: (material: Material) => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  material,
  onClose,
  onDownload,
}) => {
  if (!material) return null;

  const [isDownloading, setIsDownloading] = useState(false);
  const [r2PreviewUrl, setR2PreviewUrl] = useState<string | null>(null);
  const [prevLoading, setPrevLoading] = useState(false);
  const [prevError, setPrevError] = useState<string | null>(null);
  const [prevErrorDetails, setPrevErrorDetails] = useState<{
    status?: number;
    error?: string;
    action?: string;
    storagePath?: string;
  } | null>(null);
  const [fetchTriggerCount, setFetchTriggerCount] = useState(0);

  React.useEffect(() => {
    if (material && material.storageProvider === "cloudflare-r2") {
      if (!material.storagePath) {
        setPrevError("Missing secure storage path (storagePath) for Cloudflare R2 material.");
        setPrevErrorDetails({
          status: 400,
          error: "Missing secure storage path (storagePath) for Cloudflare R2 material.",
          action: "preview",
          storagePath: ""
        });
        return;
      }
      let active = true;
      const fetchSignedUrl = async () => {
        setPrevLoading(true);
        setPrevError(null);
        setPrevErrorDetails(null);
        try {
          const token = await auth.currentUser?.getIdToken();
          if (!token) {
            const expiredMsg = "Your session expired. Please log in again.";
            if (active) {
              setPrevError(expiredMsg);
              setPrevErrorDetails({
                status: 401,
                error: expiredMsg,
                action: "preview",
                storagePath: material.storagePath
              });
            }
            throw new Error(expiredMsg);
          }

          const response = await fetch(apiUrl("/api/r2/signed-url"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              materialId: material.id,
              storagePath: material.storagePath,
              action: "preview",
              fileName: material.fileName
            })
          });

          if (!response.ok) {
            let errMsg = `Server responded with status ${response.status}`;
            if (response.status === 401) {
              errMsg = "Your session expired. Please log in again.";
            } else if (response.status === 403) {
              errMsg = "You are not authorized to access this material.";
            } else if (response.status === 404) {
              errMsg = "Backend API route not found. Check VITE_API_BASE_URL or backend deployment.";
            } else {
              const errData = await response.json().catch(() => ({}));
              errMsg = errData.error || errData.message || errMsg;
            }

            if (active) {
              setPrevError(errMsg);
              setPrevErrorDetails({
                status: response.status,
                error: errMsg,
                action: "preview",
                storagePath: material.storagePath
              });
            }
            throw new Error(errMsg);
          }

          const data = await response.json();
          if (active) {
            if (data.ok && data.signedUrl) {
              setR2PreviewUrl(data.signedUrl);
            } else {
              const errMsg = "Invalid signed URL response from server";
              setPrevError(errMsg);
              setPrevErrorDetails({
                status: response.status,
                error: errMsg,
                action: "preview",
                storagePath: material.storagePath
              });
              throw new Error(errMsg);
            }
          }
        } catch (err: any) {
          console.error("Failed to generate signed URL for preview:", err);
          if (active) {
            const errMsg = err.message || "Unable to prepare secure PDF link. Please try again.";
            setPrevError(errMsg);
            if (!prevErrorDetails) {
              setPrevErrorDetails({
                status: 0,
                error: errMsg,
                action: "preview",
                storagePath: material.storagePath
              });
            }
          }
        } finally {
          if (active) {
            setPrevLoading(false);
          }
        }
      };

      fetchSignedUrl();

      return () => {
        active = false;
      };
    } else {
      setR2PreviewUrl(null);
      setPrevError(null);
      setPrevErrorDetails(null);
      setPrevLoading(false);
    }
  }, [material, fetchTriggerCount]);

  const effectivePreviewUrl = material.storageProvider === "cloudflare-r2" ? r2PreviewUrl : material.previewUrl;

  const handleDownloadClick = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await onDownload(material);
    } catch (err) {
      console.error("Direct download execution error inside preview modal context:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      {/* Container holding premium cyberspace cinema PDF experience */}
      <div className="w-full max-w-5xl h-[88vh] rounded-2xl bg-slate-950 border border-slate-800 flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top bar controls */}
        <div className="h-14 px-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 font-sans">
            <div className="p-1 px-2.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyber-cyan text-xs font-mono font-bold whitespace-nowrap">
              PDF SECURE READER
            </div>
            <h3 className="font-display font-bold text-slate-200 text-sm truncate max-w-sm sm:max-w-md" title={material.title}>
              {material.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {effectivePreviewUrl && (
              <a
                href={effectivePreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:text-white hover:bg-slate-850 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Open in New Tab</span>
              </a>
            )}
            <button
              onClick={handleDownloadClick}
              disabled={isDownloading}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-400 disabled:bg-slate-900 disabled:border disabled:border-slate-850 disabled:opacity-55 text-slate-950 disabled:text-slate-500 text-xs font-bold hover:bg-cyan-300 transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action adjustments header or file info */}
        <div className="h-11 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 gap-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">File:</span>
            <span className="text-slate-300 font-bold truncate max-w-[150px] sm:max-w-xs">{material.fileName}</span>
            <span className="text-cyber-violet font-bold">({material.fileSize})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Provider:</span>
            <span className="text-emerald-400 font-black uppercase text-[10px] bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded">
              {material.storageProvider === "cloudflare-r2" ? "Cloudflare R2" : "Supabase"}
            </span>
          </div>
        </div>

        {/* Warning notification banner explaining potential sandbox/browser restrictions */}
        {effectivePreviewUrl && (
          <div className="px-6 py-2 bg-slate-950 border-b border-slate-900 flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <p className="truncate">
              IFrame restrictions or custom ad blockers may block PDF viewing. Use the <strong className="text-slate-200">Open in New Tab</strong> or <strong className="text-slate-200">Download</strong> actions above if blank.
            </p>
          </div>
        )}

        {/* PDF Main sheet area (Native Object Embed with supportive Fallbacks) */}
        <div className="flex-1 bg-slate-900/60 p-4 flex items-center justify-center overflow-hidden">
          {material.storageProvider === "cloudflare-r2" && prevLoading ? (
            <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 font-sans justify-center items-center flex flex-col animate-in fade-in duration-205">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <p className="text-xs text-slate-400 font-mono">Preparing secure PDF link...</p>
            </div>
          ) : material.storageProvider === "cloudflare-r2" && prevError ? (
            <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-4 font-sans text-left animate-in fade-in">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Secure R2 Link Request Failed
                  </h4>
                  <p className="text-[10px] text-rose-450 font-mono">
                    HTTP {prevErrorDetails?.status !== undefined ? prevErrorDetails.status : 500} - Link Retrieval Failure
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl">
                  <p className="text-[11px] text-rose-300 font-semibold mb-1 uppercase tracking-wider">Error Details:</p>
                  <p className="text-xs text-rose-200 font-mono whitespace-pre-wrap leading-relaxed">
                    {prevErrorDetails?.error || prevError}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/40">
                    <span className="text-slate-500 block mb-0.5 uppercase">Action context:</span>
                    <span className="text-slate-300 font-bold">{prevErrorDetails?.action || "preview"}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/40">
                    <span className="text-slate-500 block mb-0.5 uppercase">Provider:</span>
                    <span className="text-slate-300 font-bold">cloudflare-r2</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/40 font-mono text-[11px] overflow-x-auto">
                  <span className="text-slate-500 block mb-0.5 uppercase">R2 Storage Path:</span>
                  <span className="text-slate-300 break-all">{prevErrorDetails?.storagePath || material.storagePath || "N/A"}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setPrevError(null);
                    setPrevErrorDetails(null);
                    setFetchTriggerCount(c => c + 1);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-350 hover:text-white font-medium font-mono hover:border hover:border-cyan-500/20 cursor-pointer transition-all"
                >
                  Retrieve Link Again
                </button>
              </div>
            </div>
          ) : !effectivePreviewUrl ? (
            <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 font-sans">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider">
                PDF preview is not available for this material.
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                No secure storage preview link found for this textbook in the Firestore metadata roster.
              </p>
            </div>
          ) : (
            <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 relative flex flex-col">
              <object
                data={`${effectivePreviewUrl}#toolbar=1`}
                type="application/pdf"
                className="w-full h-full border-0 bg-slate-900"
              >
                {/* Fallback component displayed if browser blocks direct PDF embedding */}
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-6 font-sans bg-slate-950/80">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 animate-pulse">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h4 className="text-sm font-mono font-bold text-slate-250 uppercase tracking-wider">
                      PDF preview has been suppressed by browser
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      PDF preview is blocked in this browser preview. Please open in a new tab or download the PDF using the system connections.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href={effectivePreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-lg bg-cyan-400 text-slate-950 text-xs font-bold hover:bg-cyan-300 transition flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open PDF in New Tab
                    </a>
                    <button
                      onClick={handleDownloadClick}
                      disabled={isDownloading}
                      className="px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-250 text-xs font-bold hover:bg-slate-850 hover:text-white transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Direct Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download PDF File
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </object>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
