import React, { useState } from "react";
import { X, Download, AlertCircle, ExternalLink, FileText, Loader2 } from "lucide-react";
import { Material } from "../types";

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
            {material.previewUrl && (
              <a
                href={material.previewUrl}
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
              className="px-3.5 py-1.5 rounded-lg bg-cyan-400 disabled:bg-cyan-550/40 disabled:opacity-55 text-slate-950 text-xs font-bold hover:bg-cyan-300 transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
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
              {material.storageProvider === "supabase" ? "Supabase Storage Vector" : "Catalog Index"}
            </span>
          </div>
        </div>

        {/* Warning notification banner explaining potential sandbox/browser restrictions */}
        {material.previewUrl && (
          <div className="px-6 py-2 bg-slate-950 border-b border-slate-900 flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <p className="truncate">
              IFrame restrictions or custom ad blockers may block PDF viewing. Use the <strong className="text-slate-200">Open in New Tab</strong> or <strong className="text-slate-200">Download</strong> actions above if blank.
            </p>
          </div>
        )}

        {/* PDF Main sheet area (Native Object Embed with supportive Fallbacks) */}
        <div className="flex-1 bg-slate-900/60 p-4 flex items-center justify-center overflow-hidden">
          {!material.previewUrl ? (
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
                data={`${material.previewUrl}#toolbar=1`}
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
                      href={material.previewUrl}
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
