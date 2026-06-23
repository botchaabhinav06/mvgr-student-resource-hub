import React, { useState } from 'react';
import { Database, AlertCircle, CheckCircle, Loader2, Sparkles, FolderLock } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { apiUrl } from '../lib/apiBase';

export const NormalizationReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [applying, setApplying] = useState(false);

    const runDryRun = async () => {
        setLoading(true);
        setError(null);
        setReport(null);

        try {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch(apiUrl("/api/admin/normalization/dry-run"), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!data.ok) throw new Error(data.message || "Failed to run dry-run.");
            setReport(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const runApply = async () => {
        if (!confirm("Apply normalization now? This writes additive normalized fields to Firestore but does not delete original fields.")) return;
        
        setApplying(true);
        setError(null);

        try {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch(apiUrl("/api/admin/normalization/apply"), {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ confirm: true })
            });

            const data = await response.json();
            if (!data.ok) throw new Error(data.message || "Failed to apply migration.");
            
            // Re-run dry run to show updated status
            await runDryRun();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="p-6 rounded-2xl cyber-glass border border-slate-700/10 dark:border-slate-800 shadow-md space-y-4 font-sans text-xs sm:text-sm">
            <h3 className="font-display font-bold text-sm text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                <Database className="w-4.5 h-4.5 text-cyber-cyan" />
                Data Normalization Command Tool
            </h3>
            
            {!report && (
                <button
                    onClick={runDryRun}
                    disabled={loading}
                    className="px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/15 text-cyber-cyan border border-cyan-500/20 rounded-xl transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 font-mono font-bold text-xs uppercase cursor-pointer"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Executing Dry-Run scan...
                        </>
                    ) : (
                        "Run Normalization Dry-run"
                    )}
                </button>
            )}

            {error && (
                <div className="flex items-center gap-2 text-rose-450 font-mono text-xs p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    SYSTEM EXCEPTION // {error}
                </div>
            )}

            {report && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
                        <CheckCircle className="w-4.5 h-4.5" />
                        DRY-RUN SCAN COMPLETE // LOG ENTRY FILED
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-300 font-mono bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
                        <div className="space-y-0.5">
                            <span className="text-slate-500 block text-[9px] uppercase">Users Scanned</span>
                            <span className="text-sm font-bold text-slate-200">{report.summary.usersScanned}</span>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-slate-500 block text-[9px] uppercase">Materials Scanned</span>
                            <span className="text-sm font-bold text-slate-200">{report.summary.materialsScanned}</span>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-slate-500 block text-[9px] uppercase">Users Normalized</span>
                            <span className="text-sm font-bold text-slate-200">{report.summary.usersCanNormalize}</span>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-slate-500 block text-[9px] uppercase">Materials Normalized</span>
                            <span className="text-sm font-bold text-slate-200">{report.summary.materialsCanNormalize}</span>
                        </div>
                        <div className="space-y-0.5 font-sans">
                            <span className="text-slate-500 block text-[9px] font-mono uppercase">Users Needs Review</span>
                            <span className={`text-sm font-bold block ${report.summary.usersNeedReview > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                                {report.summary.usersNeedReview}
                            </span>
                        </div>
                        <div className="space-y-0.5 font-sans">
                            <span className="text-slate-500 block text-[9px] font-mono uppercase">Materials Needs Review</span>
                            <span className={`text-sm font-bold block ${report.summary.materialsNeedReview > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                                {report.summary.materialsNeedReview}
                            </span>
                        </div>
                    </div>

                    {report.summary.usersNeedReview === 0 && report.summary.materialsNeedReview === 0 && (
                        <div className="space-y-3 pt-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
                                <Sparkles className="w-4 h-4 text-cyber-cyan" />
                                Ready to apply normalized entries to matching database blocks.
                            </div>
                            <button
                                onClick={runApply}
                                disabled={applying}
                                className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/15 text-rose-450 border border-rose-500/20 rounded-xl transition duration-150 disabled:opacity-50 flex items-center gap-2 font-mono font-bold text-xs uppercase cursor-pointer"
                            >
                                {applying ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Applying Database migrations...
                                    </>
                                ) : (
                                    "Apply Normalization"
                                )}
                            </button>
                        </div>
                    )}

                    <div className="text-[10px] text-slate-500 italic font-mono pt-1">
                        Dry-run data generated purely from passive scanning snapshots. No writes are made until normalization commits.
                    </div>
                </div>
            )}
        </div>
    );
};
