import React, { useState, useEffect } from "react";
import { Sparkles, Shield, ToggleLeft, Sliders, Activity, Key, Database, AlertCircle, RefreshCw, Layers, CheckCircle2, XCircle, Play, Loader2, FileText } from "lucide-react";
import { auth } from "../../firebase/firebaseConfig";
import { apiUrl } from "../../lib/apiBase";

interface AdminAIControlViewProps {
  materials?: any[];
}

export const AdminAIControlView: React.FC<AdminAIControlViewProps> = ({ materials = [] }) => {
  // AI Health Check States
  const [healthStatus, setHealthStatus] = useState<"unchecked" | "checking" | "success" | "failed">("unchecked");
  const [healthData, setHealthData] = useState<any | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  // AI Smoke Test States
  const [smokeStatus, setSmokeStatus] = useState<"not_tested" | "testing" | "success" | "failed">("not_tested");
  const [smokeResult, setSmokeResult] = useState<string | null>(null);
  const [smokeError, setSmokeError] = useState<string | null>(null);

  // AI Diagnostics State
  const [diagnosticData, setDiagnosticData] = useState<{
    configuredModel: string;
    selectedModel: string;
    availableTextModels: string[];
    modelsAttempted: string[];
    hasProviderKey: boolean;
    discoverySupported: boolean;
    academicPrimaryModel?: string;
    academicFallbackModel?: string;
    ok?: boolean;
    message?: string;
  } | null>(null);
  const [smokeModelUsed, setSmokeModelUsed] = useState<string | null>(null);
  const [smokeModelsAttempted, setSmokeModelsAttempted] = useState<string[]>([]);

  // PDF Text Extraction Test States
  const [targetMaterialId, setTargetMaterialId] = useState<string>("");
  const [extractionStatus, setExtractionStatus] = useState<"idle" | "loading" | "success" | "failed">("idle");
  const [extractionResult, setExtractionResult] = useState<{
    materialId: string;
    title: string;
    pageCount: number | null;
    extractedChars: number;
    truncated: boolean;
    previewText: string;
    quality?: {
      qualityStatus: "good" | "weak" | "poor" | "empty";
      qualityScore: number;
      meaningfulChars: number;
      wordCount: number;
      uniqueWordCount: number;
      alphanumericRatio: number;
      averageWordLength: number;
      repeatedMarkerRatio: number;
      pageMarkerOnlyDetected: boolean;
      likelyScannedOrImagePdf: boolean;
      warnings: string[];
      aiUsable: boolean;
    };
    message: string;
  } | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Filter active Cloudflare R2 materials for easy selector
  const r2Materials = materials.filter(
    (m) => m.storageProvider === "cloudflare-r2" && m.status === "active"
  );

  // Trigger health check on load
  useEffect(() => {
    handleCheckHealth();
  }, []);

  const handleCheckHealth = async () => {
    setHealthStatus("checking");
    setHealthError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Unable to retrieve authorization token. Please log in again.");
      }

      const response = await fetch(apiUrl("/api/ai/health"), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Only active administrators are authorized to fetch AI health telemetry.");
        }
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data && data.ok) {
        setHealthData(data);
        setHealthStatus("success");

        // Load model diagnostic in parallel
        try {
          const diagResponse = await fetch(apiUrl("/api/ai/models-diagnostic"), {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          const diagData = await diagResponse.json();
          if (diagResponse.ok && diagData.ok) {
            setDiagnosticData(diagData);
          } else {
            console.warn("[Diagnostics Fetch Warning]:", diagData?.message);
            setDiagnosticData({
              configuredModel: "Error fetching",
              selectedModel: "Error",
              availableTextModels: [],
              modelsAttempted: [],
              hasProviderKey: false,
              discoverySupported: false,
              ok: false,
              message: diagData?.message || "Model discovery failed."
            });
          }
        } catch (diagErr: any) {
          console.warn("[Diagnostics Fetch Warning]:", diagErr);
          setDiagnosticData({
            configuredModel: "Error fetching",
            selectedModel: "Error",
            availableTextModels: [],
            modelsAttempted: [],
            hasProviderKey: false,
            discoverySupported: false,
            ok: false,
            message: diagErr.message || "Failed to load diagnostics."
          });
        }
      } else {
        throw new Error(data?.message || "Invalid response structure from AI health endpoint.");
      }
    } catch (err: any) {
      console.error("[AI Health Check Error]:", err);
      setHealthStatus("failed");
      setHealthError(err.message || "Unable to reach AI backend server.");
    }
  };

  const handleRunSmokeTest = async () => {
    setSmokeStatus("testing");
    setSmokeError(null);
    setSmokeResult(null);
    setSmokeModelUsed(null);
    setSmokeModelsAttempted([]);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Authorization credentials missing. Please sign in again.");
      }

      const response = await fetch(apiUrl("/api/ai/model-generate-diagnostic"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (data && data.modelsAttempted) {
          setSmokeModelsAttempted(data.modelsAttempted);
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error("Only active administrators are authorized to execute the AI smoke test.");
        }
        if (response.status === 502) {
          throw new Error(data?.message || "Backend reached Gemini, but the provider returned an error. Check model name and API key validity.");
        }
        throw new Error(data?.message || `Server connectivity test failed with status ${response.status}`);
      }

      if (data && data.ok) {
        setSmokeResult(data.response || "No response content.");
        setSmokeModelUsed(data.modelUsed || null);
        setSmokeModelsAttempted(data.modelsAttempted || [data.modelUsed]);
        setSmokeStatus("success");
      } else {
        // Handle gracefully if missing key reported in a successful 200/OK response or payload
        if (data?.message && data.message.includes("not configured")) {
          throw new Error("Gemini API key is not configured on the backend. Add GEMINI_API_KEY in Render and redeploy.");
        }
        throw new Error(data?.message || "AI connectivity test returned failure status.");
      }
    } catch (err: any) {
      console.error("[AI Smoke Test Error]:", err);
      setSmokeStatus("failed");
      
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setSmokeError("Unable to reach AI backend. Check Render deployment and backend logs.");
      } else {
        setSmokeError(msg);
      }
    }
  };

  const handleExtractText = async (selectedId?: string) => {
    const materialId = selectedId || targetMaterialId;
    if (!materialId) {
      setExtractionError("Please select or enter a material ID.");
      return;
    }

    setExtractionStatus("loading");
    setExtractionError(null);
    setExtractionResult(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Unable to retrieve session credentials. Please sign in again.");
      }

      const response = await fetch(apiUrl("/api/ai/extract-pdf-text-test"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ materialId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Extraction failed with server status ${response.status}`);
      }

      if (data && data.ok) {
        setExtractionResult(data);
        setExtractionStatus("success");
      } else {
        throw new Error(data.message || "Failed to parse PDF text extraction payload.");
      }
    } catch (err: any) {
      console.error("[PDF Extraction UI Error]:", err);
      setExtractionError(err.message || "An unexpected error occurred during PDF text extraction.");
      setExtractionStatus("failed");
    }
  };

  const globalToggles = [
    { id: "summary", name: "PDF Summarizer", active: true, phase: "Phase 13.2" },
    { id: "questions", name: "Important Questions Generator", active: true, phase: "Phase 13.2" },
    { id: "notes", name: "Short Notes Creator", active: false, phase: "Phase 13.4" },
    { id: "terms", name: "Key Terms Extractor", active: false, phase: "Phase 13.4" },
    { id: "chat", name: "Document Context Q&A", active: false, phase: "Phase 14.0" },
    { id: "mini", name: "Mini Study Assistant", active: false, phase: "Phase 14.1" },
  ];

  const limits = [
    { role: "Student Quota", max: "5 Queries / Day", description: "Standard learning access scope" },
    { role: "Faculty Quota", max: "10 Queries / Day", description: "Metadata extraction & summary draft scope" },
    { role: "Admin Quota", max: "20 Queries / Day", description: "System diagnostics scope" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyber-cyan">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-100 uppercase tracking-tight">
              AI Command & Controls
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyber-cyan border border-cyan-500/30 rounded">
              Phase 12.1 - Skeleton
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            System administration controls for security parameters, daily role constraints, caching policies, and diagnostic analytics.
          </p>
        </div>
      </div>

      {/* Secrets Reminder Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start gap-4">
        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyber-cyan shrink-0 border border-cyan-500/20">
          <Key className="w-6 h-6" />
        </div>
        <div className="space-y-2 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              Secure Provider Strategy
            </h3>
            <span className="px-2 py-0.5 text-[9px] font-mono font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded">
              Compliant
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
            To strictly ensure security and exclude any exposure vector, all API keys (such as Google Gemini credentials) reside exclusively in production server-side environment variables on our Render container host. The frontend codebase remains entirely decoupled from direct LLM vendor calls.
          </p>
        </div>
      </div>

      {/* Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Toggles and Limits column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Feature Toggles */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <ToggleLeft className="w-4 h-4 text-cyber-cyan" />
              <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                AI Service Controls
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {globalToggles.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-300">{item.name}</span>
                    <p className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                      Target Deployment: {item.phase}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wide font-bold">
                      {item.active ? "Enabled" : "Disabled"}
                    </span>
                    <button
                      disabled
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        item.active ? "bg-cyan-500/40" : "bg-slate-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                          item.active ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Performance & Caching Configuration */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <Database className="w-4 h-4 text-cyber-cyan" />
              <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                Caching & Document Extraction Policies
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] font-sans">
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase font-mono text-[10px] tracking-wider mb-1">
                    Maximum Document Processing Limit
                  </label>
                  <input
                    type="text"
                    disabled
                    value="15 Pages / 150,000 Characters"
                    className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase font-mono text-[10px] tracking-wider mb-1">
                    Cache Strategy (aiOutputs)
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Permanent Document Hash Match (Aggressive)"
                    className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase font-mono text-[10px] tracking-wider mb-1">
                    Primary Provider Config
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Google Gemini Pro Engine (gemini-2.5-flash)"
                    className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase font-mono text-[10px] tracking-wider mb-1">
                    Global On/Off Switch
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Active (Controls Locked Until Implementation)"
                    className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cloudflare R2 PDF Text Extraction Test (Phase 13.1) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <FileText className="w-4 h-4 text-cyber-cyan" />
              <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                R2 PDF Text Extraction Test (Phase 13.1)
              </h3>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Verify secure backend-only text extraction from Cloudflare R2 PDF documents. Select an active resource or manually provide a materialId to test role validation and whitespace normalization.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-400 uppercase font-mono text-[9px] tracking-wider mb-1">
                  Active R2 Material Catalog
                </label>
                {r2Materials.length === 0 ? (
                  <p className="text-[10px] text-slate-500 font-mono italic">
                    No active Cloudflare R2 materials found in local state.
                  </p>
                ) : (
                  <select
                    value={targetMaterialId}
                    onChange={(e) => {
                      setTargetMaterialId(e.target.value);
                      setExtractionError(null);
                      setExtractionResult(null);
                    }}
                    className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-300 font-sans text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Choose Active R2 Study Resource --</option>
                    {r2Materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title || "Untitled"} ({m.department || "General"} | {m.id})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase font-mono text-[9px] tracking-wider mb-1">
                  Or Enter Custom Material ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetMaterialId}
                    onChange={(e) => {
                      setTargetMaterialId(e.target.value);
                      setExtractionError(null);
                      setExtractionResult(null);
                    }}
                    placeholder="e.g. MAT-1719216000"
                    className="flex-1 px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => handleExtractText()}
                    disabled={extractionStatus === "loading" || !targetMaterialId}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 font-bold rounded text-xs transition duration-150 flex items-center gap-1 cursor-pointer"
                  >
                    {extractionStatus === "loading" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    <span>Run</span>
                  </button>
                </div>
              </div>

              {/* Extraction error reporting */}
              {extractionError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Extraction Test Failed:</span>
                    <p className="mt-0.5 font-mono text-[10px] text-rose-300 leading-relaxed font-semibold">
                      {extractionError}
                    </p>
                  </div>
                </div>
              )}

              {/* Success Result Box */}
              {extractionStatus === "success" && extractionResult && (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>PDF Decoded Successfully</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {extractionResult.message.includes("quality is too low") ? "Warning: Low Quality" : "Success"}
                    </span>
                  </div>

                  {/* Extraction Metadata Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 bg-slate-950/40 p-2.5 rounded border border-slate-850">
                    <div>
                      <span className="text-slate-500">Document Title:</span>
                      <p className="text-slate-200 font-bold truncate">{extractionResult.title}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Page Count:</span>
                      <p className="text-slate-200 font-bold">{extractionResult.pageCount ?? "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Extracted Chars:</span>
                      <p className="text-slate-200 font-bold">{extractionResult.extractedChars} chars</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Truncated:</span>
                      <p className={extractionResult.truncated ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                        {extractionResult.truncated ? "Yes (>20k Chars)" : "No"}
                      </p>
                    </div>
                  </div>

                  {/* Quality Analysis Panel (Phase 13.1D Guard) */}
                  {extractionResult.quality && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-3 text-[11px]">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Extraction Quality Analysis
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Quality Status Badge */}
                          {extractionResult.quality.qualityStatus === "good" && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Good Quality
                            </span>
                          )}
                          {extractionResult.quality.qualityStatus === "weak" && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Weak Quality
                            </span>
                          )}
                          {(extractionResult.quality.qualityStatus === "poor" || extractionResult.quality.qualityStatus === "empty") && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              Poor Quality
                            </span>
                          )}

                          {/* AI Usable Flag Badge */}
                          {extractionResult.quality.aiUsable ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20">
                              AI USABLE: YES
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                              AI USABLE: NO
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quality Score Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-slate-500">Heuristic Quality Score:</span>
                          <span className={`font-bold ${
                            extractionResult.quality.qualityScore >= 70 ? "text-emerald-400" :
                            extractionResult.quality.qualityScore >= 40 ? "text-amber-400" : "text-rose-400"
                          }`}>
                            {extractionResult.quality.qualityScore}/100
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              extractionResult.quality.qualityScore >= 70 ? "bg-emerald-500" :
                              extractionResult.quality.qualityScore >= 40 ? "bg-amber-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${extractionResult.quality.qualityScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Quality Metrics Grid */}
                      <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-900/50">
                          <span className="text-slate-500 block text-[9px]">Words Extracted</span>
                          <span className="text-slate-200 font-bold block mt-0.5">
                            {extractionResult.quality.wordCount}
                          </span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-900/50">
                          <span className="text-slate-500 block text-[9px]">Unique Words</span>
                          <span className="text-slate-200 font-bold block mt-0.5">
                            {extractionResult.quality.uniqueWordCount}
                          </span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-900/50">
                          <span className="text-slate-500 block text-[9px]">Alphanumeric %</span>
                          <span className="text-slate-200 font-bold block mt-0.5">
                            {Math.round(extractionResult.quality.alphanumericRatio * 100)}%
                          </span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-900/50">
                          <span className="text-slate-500 block text-[9px]">Avg Word Len</span>
                          <span className="text-slate-200 font-bold block mt-0.5">
                            {extractionResult.quality.averageWordLength} chars
                          </span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-900/50">
                          <span className="text-slate-500 block text-[9px]">Page Marker %</span>
                          <span className="text-slate-200 font-bold block mt-0.5">
                            {Math.round(extractionResult.quality.repeatedMarkerRatio * 100)}%
                          </span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-900/50">
                          <span className="text-slate-500 block text-[9px]">Meaningful Chars</span>
                          <span className="text-slate-200 font-bold block mt-0.5">
                            {extractionResult.quality.meaningfulChars}
                          </span>
                        </div>
                      </div>

                      {/* Heuristic Flags & Warnings */}
                      {extractionResult.quality.warnings && extractionResult.quality.warnings.length > 0 && (
                        <div className="space-y-1 bg-slate-900/30 p-2 rounded border border-slate-900 text-[10px]">
                          <span className="text-slate-400 font-semibold uppercase font-mono text-[9px] block">
                            System Flags & Warnings:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {extractionResult.quality.warnings.map((warning, idx) => (
                              <span 
                                key={idx} 
                                className="px-1.5 py-0.5 rounded text-[8px] font-mono font-semibold bg-slate-900 text-amber-400 border border-amber-500/10"
                              >
                                {warning}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Scanned / Low Quality Recommendation Warning */}
                      {!extractionResult.quality.aiUsable && (
                        <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg text-rose-400 font-sans text-[10px] leading-relaxed">
                          <span className="font-bold block uppercase mb-0.5 text-[9px] tracking-wider">
                            Recommendation for Future Phases:
                          </span>
                          This PDF was decoded, but it may be scanned, image-only, or have a weak/broken text layer. AI summary generation is locked or not recommended unless a high-quality text-based PDF is uploaded. OCR support can be considered in future iterations if required.
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <span className="block font-bold text-slate-400 uppercase font-mono text-[9px] tracking-wider mb-1">
                      Text Preview (Max 1000 Chars)
                    </span>
                    <div className="p-3 rounded bg-slate-950 text-slate-300 font-mono text-[10px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-850">
                      {extractionResult.previewText}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column Limits and Metrics */}
        <div className="space-y-6">
          
          {/* AI Backend Smoke Test & Health Check Panel */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyber-cyan" />
                <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                  AI Backend Smoke Test
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20 rounded">
                DevOps
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Verify that the backend-only Gemini connection is configured correctly using secure server-side proxies.
            </p>

            {/* Config metadata fields */}
            <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-850 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Provider:</span>
                <span className="text-slate-300 font-bold uppercase">Gemini</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Configured Model (ENV):</span>
                <span className="text-slate-300 font-semibold">
                  {diagnosticData?.configuredModel || "Not set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Academic Primary Model:</span>
                <span className="text-cyber-cyan font-semibold">
                  {diagnosticData?.academicPrimaryModel || "gemini-3.1-flash-lite"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Academic Fallback Model:</span>
                <span className="text-slate-300 font-semibold">
                  {diagnosticData?.academicFallbackModel || "gemini-3.5-flash"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Working Model:</span>
                <span className="text-emerald-400 font-bold">
                  {diagnosticData?.selectedModel || "Resolving..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Model Discovery:</span>
                <span className={diagnosticData?.discoverySupported ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                  {diagnosticData?.discoverySupported ? "Active (SDK v1.52.0)" : "Unavailable"}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-slate-900 pt-1.5 mt-1">
                <span className="text-slate-500">Diagnostic Models Attempted:</span>
                <span className="text-cyber-cyan leading-normal text-[9px]">
                  {diagnosticData?.modelsAttempted?.length 
                    ? diagnosticData.modelsAttempted.join(" → ") 
                    : "None detected / waiting"}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-slate-900 pt-1.5 mt-1">
                <span className="text-slate-500">Available Text Models:</span>
                <span className="text-slate-400 leading-normal font-sans text-[9px]">
                  {diagnosticData?.availableTextModels?.length 
                    ? diagnosticData.availableTextModels.join(", ") 
                    : "None detected / waiting"}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-900 pt-1.5 mt-1">
                <span className="text-slate-500">Key Location:</span>
                <span className="text-emerald-400 font-bold">Render Secret Env</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Diag Endpoint:</span>
                <span className="text-slate-300">/api/ai/model-generate-diagnostic</span>
              </div>
              <div className="flex justify-between border-t border-slate-900 pt-2 mt-2">
                <span className="text-slate-500">Health Status:</span>
                {healthStatus === "checking" ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Querying...
                  </span>
                ) : healthStatus === "success" ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> ACTIVE {healthData?.hasProviderKey ? "(Key Set)" : "(No Key)"}
                  </span>
                ) : healthStatus === "failed" ? (
                  <span className="text-red-400 flex items-center gap-1 font-bold">
                    <XCircle className="w-3 h-3" /> OFFLINE
                  </span>
                ) : (
                  <span className="text-slate-500">NOT CHECKED</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Smoke Result:</span>
                {smokeStatus === "testing" ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Testing...
                  </span>
                ) : smokeStatus === "success" ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> SUCCESS
                  </span>
                ) : smokeStatus === "failed" ? (
                  <span className="text-red-400 flex items-center gap-1 font-bold">
                    <XCircle className="w-3 h-3" /> FAILED
                  </span>
                ) : (
                  <span className="text-slate-500">NOT TESTED</span>
                )}
              </div>
              {smokeModelUsed && (
                <div className="flex justify-between border-t border-slate-900 pt-1.5 mt-1 text-[9px]">
                  <span className="text-slate-500">Model Verified:</span>
                  <span className="text-emerald-400 font-bold">{smokeModelUsed}</span>
                </div>
              )}
              {smokeModelsAttempted.length > 0 && (
                <div className="flex flex-col gap-1 border-t border-slate-900 pt-1.5 mt-1 text-[9px]">
                  <span className="text-slate-500">Models Attempted Sequential:</span>
                  <span className="text-cyber-cyan font-semibold">{smokeModelsAttempted.join(" → ")}</span>
                </div>
              )}
            </div>

            {/* Mismatched / Stale Config Warning Banner */}
            {diagnosticData && diagnosticData.configuredModel !== diagnosticData.selectedModel && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-300 leading-relaxed font-sans">
                <strong className="text-amber-200">⚠️ Model Configuration Notice:</strong> The active environment model config (<code className="font-mono">{diagnosticData.configuredModel}</code>) differs from the dynamically selected stable working model (<code className="font-mono">{diagnosticData.selectedModel}</code>). Update <code className="font-mono">GEMINI_MODEL</code> in Render to the selected working model to enforce this standard.
              </div>
            )}

            {/* Success Results / Error Display Panel */}
            {(smokeResult || smokeError || healthError) && (
              <div className="p-3.5 rounded-xl border text-[11px] leading-relaxed transition-all duration-300 animate-in fade-in slide-in-from-top-1 bg-slate-950">
                {smokeResult && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider">
                      ★ Gemini Response Received:
                    </div>
                    <p className="text-slate-200 font-mono p-2 bg-slate-900 rounded border border-slate-850">
                      "{smokeResult}"
                    </p>
                    <p className="text-[10px] text-slate-500 italic mt-1">
                      AI backend configured successfully.
                    </p>
                  </div>
                )}
                {smokeError && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-mono font-bold text-red-400 tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Smoke Test Error:
                    </div>
                    <p className="text-slate-300 bg-red-500/5 p-2 rounded border border-red-500/10 font-mono">
                      {smokeError}
                    </p>
                  </div>
                )}
                {healthError && (
                  <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-900">
                    <div className="text-[10px] uppercase font-mono font-bold text-red-400 tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Health Fetch Error:
                    </div>
                    <p className="text-slate-300 bg-red-500/5 p-2 rounded border border-red-500/10 font-mono">
                      {healthError}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleCheckHealth}
                disabled={healthStatus === "checking"}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-xs font-semibold text-slate-300 hover:text-slate-100 transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {healthStatus === "checking" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Check AI Health
              </button>

              <button
                onClick={handleRunSmokeTest}
                disabled={smokeStatus === "testing"}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-cyber-cyan hover:bg-cyan-400 text-xs font-bold text-slate-950 transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {smokeStatus === "testing" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                Test AI Backend
              </button>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyber-cyan" />
              <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                Role Daily Quotas
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Automatic daily user tracking logs are checked via secure database triggers prior to dispatching model queries.
            </p>

            <div className="space-y-3 pt-2">
              {limits.map((l, index) => (
                <div key={index} className="p-3 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-300">{l.role}</span>
                    <p className="text-[10px] text-slate-500">{l.description}</p>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-mono font-bold bg-cyan-500/10 text-cyber-cyan border border-cyan-500/20 rounded">
                    {l.max}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Planned Performance Metrics Monitor */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyber-cyan" />
                <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-widest">
                  Live Usage Tracker
                </h3>
              </div>
              <span className="text-[9px] font-mono text-slate-500">Planned</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Under development. Analytics widgets will load direct database aggregation counters for token allocation audit trails.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[10px] font-bold">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-center">
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Total Hits</span>
                <span className="text-slate-400 font-extrabold text-xs">--</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-center">
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Errors Logged</span>
                <span className="text-slate-400 font-extrabold text-xs">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
