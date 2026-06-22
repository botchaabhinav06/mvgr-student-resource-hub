import React, { useState } from 'react';
import { Database, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { apiUrl } from '../lib/apiBase';

export const NormalizationReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const runDryRun = async () => {
        setLoading(true);
        setError(null);
        setReport(null);

        try {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch(apiUrl("/api/admin/normalization/dry-run"), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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

    return (
        <div className="p-6 rounded-xl cyber-glass border border-slate-700/10 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-100 dark:text-slate-200 flex items-center gap-2">
                <Database className="w-5 h-5 text-theme-teal-action" />
                Data Normalization Admin Tool
            </h3>
            
            {!report && (
                <button
                    onClick={runDryRun}
                    disabled={loading}
                    className="px-4 py-2 bg-theme-teal-action/10 dark:bg-violet-500/10 text-theme-teal-action dark:text-cyber-violet border border-theme-teal-action/15 dark:border-violet-500/10 rounded-lg hover:bg-theme-teal-action/20 transition disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run Normalization Dry-run"}
                </button>
            )}

            {error && (
                <div className="flex items-center gap-2 text-rose-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {report && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-500 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Dry-run complete. No Firestore documents were modified.
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                        <div>Users Scanned: {report.summary.usersScanned}</div>
                        <div>Materials Scanned: {report.summary.materialsScanned}</div>
                        <div>Users Can Normalize: {report.summary.usersCanNormalize}</div>
                        <div>Materials Can Normalize: {report.summary.materialsCanNormalize}</div>
                        <div>Users Need Review: {report.summary.usersNeedReview}</div>
                        <div>Materials Need Review: {report.summary.materialsNeedReview}</div>
                    </div>

                    <div className="text-xs text-slate-500 italic">
                        This is a dry-run report only. No Firestore documents are modified from this screen.
                    </div>

                    {/* Tables could be added here, but keep it simple as requested for safety */}
                </div>
            )}
        </div>
    );
};
