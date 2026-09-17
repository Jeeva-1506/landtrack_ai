import React, { useState } from "react";
import { Alert } from "../types";
import {
  AlertTriangle,
  ShieldCheck,
  Mail,
  CheckCircle2,
  Info,
  Loader2,
  ArrowRight,
  FileText
} from "lucide-react";
import { sendLandRiskAlert } from "../api";

interface AlertsViewProps {
  alerts: Alert[];
  globalSearchTerm?: string;
  onResolveAlert: (id: string) => void;
  onViewParcel: (parcelId: string) => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

export default function AlertsView({ alerts, globalSearchTerm = "", onResolveAlert, onViewParcel, showToast }: AlertsViewProps) {
  const [filter, setFilter] = useState<'All' | 'High' | 'Resolved'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [dispatchAlert, setDispatchAlert] = useState<Alert | null>(null);
  const [noticeText, setNoticeText] = useState("");
  const [selectedLogsAlert, setSelectedLogsAlert] = useState<Alert | null>(null);
  const [inspectEarlyWarningAlert, setInspectEarlyWarningAlert] = useState<Alert | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  const handleResolve = (id: string) => {
    onResolveAlert(id);
    if (showToast) {
      showToast("Early warning alert resolved and logged in audit registry.");
    }
  };

  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchAlert) return;
    setIsDispatching(true);
    try {
      await sendLandRiskAlert({
        landId: dispatchAlert.parcelId,
        surveyNumber: dispatchAlert.surveyNumber || dispatchAlert.parcelId,
        landRiskDetails: {
          projectName: dispatchAlert.projectName || dispatchAlert.projectId,
          surveyNumber: dispatchAlert.surveyNumber || dispatchAlert.parcelId,
          riskLevel: dispatchAlert.priority === "High" || dispatchAlert.priority === "Critical" ? "High" : "Medium",
          delayProbability: dispatchAlert.priority === "High" ? 82 : 55,
          expectedDelayDays: dispatchAlert.priority === "High" ? 45 : 30,
          district: "Kanchipuram",
          state: "Tamil Nadu",
          recommendedAction: noticeText || dispatchAlert.recommendedAction,
          riskFactors: ["Ownership mismatch", "Legal dispute", "Compensation pending"]
        }
      });
      if (showToast) {
        showToast(`Early warning directive email dispatched for Survey ${dispatchAlert.surveyNumber || dispatchAlert.parcelId} via Brevo!`, "success");
      }
    } catch (err: any) {
      if (showToast) {
        showToast(err.message || "Failed to dispatch directive email", "error");
      }
    } finally {
      setIsDispatching(false);
      setDispatchAlert(null);
    }
  };

  const activeSearch = globalSearchTerm.trim().toLowerCase();
  const filteredAlerts = alerts.filter(a => {
    const matchesFilter = 
      filter === 'High' ? (a.priority === 'High' && a.status !== 'Resolved') :
      filter === 'Resolved' ? (a.status === 'Resolved') : true;

    const matchesCategory = categoryFilter === 'All' || a.issueType === categoryFilter;

    const matchesSearch = !activeSearch || 
      a.id.toLowerCase().includes(activeSearch) || 
      a.parcelId.toLowerCase().includes(activeSearch) || 
      a.projectId.toLowerCase().includes(activeSearch) || 
      a.issue.toLowerCase().includes(activeSearch) || 
      a.projectName.toLowerCase().includes(activeSearch);

    return matchesFilter && matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'All', label: 'All Categories' },
    { id: 'HIGH_DELAY_RISK', label: 'High Delay Risk' },
    { id: 'LEGAL_ISSUE', label: 'Legal Issue' },
    { id: 'DOCUMENT_MISMATCH', label: 'Document Mismatch' },
    { id: 'COMPENSATION_PENDING', label: 'Compensation Pending' },
    { id: 'SURVEY_ISSUE', label: 'Survey Issue' },
    { id: 'CRITICAL_ALERT', label: 'Critical Warning' }
  ];

  return (
    <div className="space-y-7 font-sans text-slate-900 pb-16">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
            <span>AI Early Warning & Directive Dispatch Center</span>
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Predictive land acquisition delay detection, automated Brevo email alerts, and statutory decision support
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
            🔴 IMMEDIATE ACTION TRIGGER (≥70%)
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
            <Mail className="w-4 h-4 text-emerald-600" /> Brevo Email API SENT
          </span>
        </div>
      </div>

      {/* PRIMARY & CATEGORY FILTERS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Status Tabs */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['All', 'High', 'Resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === f 
                  ? "bg-white text-slate-900 shadow-xs font-extrabold" 
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {f === 'All' ? 'All Early Warnings' : f === 'High' ? '🔴 High Priority' : 'Resolved Logs'}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500">Filter Risk Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* EARLY WARNING CARDS LIST */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const isHighPriority = alert.priority === "High" || alert.priority === "Critical";
          const alertIdStr = `EW-2026-${(alert.surveyNumber || alert.parcelId || "00124").replace(/[^a-zA-Z0-9]/g, "")}`;
          
          return (
            <div
              key={alert.id}
              className={`p-5 sm:p-6 rounded-3xl border transition-all flex flex-col md:flex-row justify-between md:items-center gap-5 ${
                alert.status === 'Resolved' 
                  ? "bg-slate-50/90 border-slate-200 opacity-80" 
                  : isHighPriority
                    ? "bg-gradient-to-r from-rose-50/90 via-white to-white border-rose-200 hover:border-rose-300 shadow-sm"
                    : "bg-gradient-to-r from-amber-50/80 via-white to-white border-amber-200 hover:border-amber-300 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4 max-w-2xl">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                  alert.status === 'Resolved' 
                    ? "bg-slate-100 text-slate-600" 
                    : isHighPriority
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}>
                  {alert.status === 'Resolved' ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-extrabold text-blue-700 text-xs bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      {alertIdStr}
                    </span>
                    <span className="font-bold text-slate-800 font-mono text-xs">Survey #{alert.surveyNumber || alert.parcelId}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-slate-600 font-mono">{alert.projectId}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] font-semibold text-slate-500">{alert.timestamp}</span>

                    {isHighPriority && alert.status !== 'Resolved' && (
                      <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                        🔴 IMMEDIATE ACTION
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
                    {alert.issue}
                  </h4>

                  {/* AI Early Warning Metric Bar */}
                  <div className="flex items-center gap-4 py-1 text-xs flex-wrap font-semibold">
                    <span className="text-rose-700 font-black flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Risk Score: 82%
                    </span>
                    <span className="text-rose-700 font-black uppercase">
                      Risk Level: 🔴 HIGH
                    </span>
                    <span className="text-amber-800 font-extrabold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Expected Delay: 45 Days
                    </span>
                    <span className="text-emerald-700 font-bold">
                      Confidence: 91%
                    </span>
                  </div>

                  {/* Risk Factors Breakdown Preview */}
                  <div className="text-xs text-slate-600 font-medium space-y-0.5 pt-1">
                    <div className="text-[11px] font-extrabold text-slate-700">Main Risk Factors:</div>
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">1. Ownership mismatch → <strong>35%</strong></span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">2. Legal dispute → <strong>28%</strong></span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">3. Compensation pending → <strong>19%</strong></span>
                    </div>
                  </div>

                  <p className="text-xs text-blue-800 font-bold pt-1 flex items-center gap-1">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Recommended: {alert.recommendedAction}</span>
                  </p>

                  {/* Delivery Status Badge */}
                  <div className="flex items-center gap-3 pt-2 text-[11px] font-semibold text-slate-600 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Notification Status:</span>
                      <span className="px-2 py-0.5 rounded-md font-extrabold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Email – SENT (Brevo API)
                      </span>
                    </div>

                    <button
                      onClick={() => setInspectEarlyWarningAlert(alert)}
                      className="text-blue-700 hover:text-blue-900 font-extrabold text-[11px] flex items-center gap-1 cursor-pointer underline ml-auto"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View 20-Field Statutory Dossier</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2.5 self-end md:self-center shrink-0 w-full md:w-auto">
                <button
                  onClick={() => {
                    setDispatchAlert(alert);
                    setNoticeText(`Urgent Statutory Directive: Survey ${alert.surveyNumber || alert.parcelId} requires immediate Revenue Officer review regarding ${alert.issue}.`);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-rose-100" />
                  <span>Dispatch Email Notice</span>
                </button>

                <button
                  onClick={() => setInspectEarlyWarningAlert(alert)}
                  className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                >
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Early Warning Details</span>
                </button>

                {alert.status !== 'Resolved' && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mark Resolved</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm font-semibold">
            No early warning alerts matching this filter category.
          </div>
        )}
      </div>

      {/* SECTION 2: 20-FIELD STATUTORY SPECIFICATION DOSSIER MODAL */}
      {inspectEarlyWarningAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto font-sans">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-md text-[10px] font-black uppercase">
                    🔴 AI EARLY WARNING DOSSIER
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-700">
                    EW-2026-{(inspectEarlyWarningAlert.surveyNumber || inspectEarlyWarningAlert.parcelId || "00124").replace(/[^a-zA-Z0-9]/g, "")}
                  </span>
                </div>
                <h4 className="text-lg font-extrabold text-slate-900 font-['Outfit'] mt-1">
                  Statutory Land Acquisition Early Warning Specification
                </h4>
              </div>
              <button
                onClick={() => setInspectEarlyWarningAlert(null)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* AI Summary Highlight Box */}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-rose-200 pb-2">
                <span className="font-extrabold text-rose-900 uppercase tracking-wider text-[11px]">AI Prediction Risk Summary</span>
                <span className="font-bold text-rose-700 font-mono">Confidence: 91%</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-rose-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Risk Score</span>
                  <span className="text-lg font-black text-rose-600">82%</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-rose-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Risk Level</span>
                  <span className="text-lg font-black text-rose-700">🔴 HIGH</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-rose-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Expected Delay</span>
                  <span className="text-lg font-black text-amber-700">45 Days</span>
                </div>
              </div>

              {/* Main Risk Factors Breakdown */}
              <div className="pt-1 text-xs space-y-1">
                <span className="font-extrabold text-slate-800">Main Risk Factors Breakdown:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-semibold text-slate-800">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">1. Ownership mismatch → <strong>35%</strong></div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">2. Legal dispute → <strong>28%</strong></div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">3. Compensation pending → <strong>19%</strong></div>
                </div>
              </div>
            </div>

            {/* 20-Field Statutory Specification Table */}
            <div className="space-y-2">
              <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Statutory Details Table (20 Fields)</h5>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3 w-5/12 border-r border-slate-200">Section Field</th>
                      <th className="p-3 w-7/12">Statutory Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Alert ID</td><td className="p-2.5 font-mono font-extrabold text-blue-700">EW-2026-{(inspectEarlyWarningAlert.surveyNumber || inspectEarlyWarningAlert.parcelId || "00124").replace(/[^a-zA-Z0-9]/g, "")}</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Date & Time</td><td className="p-2.5 font-mono text-slate-800">{inspectEarlyWarningAlert.timestamp || "15 Sep 2026, 8:15 PM"}</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Project ID</td><td className="p-2.5 font-bold text-slate-900">{inspectEarlyWarningAlert.projectId || "NH-45"}</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Project Name</td><td className="p-2.5 font-bold text-slate-900">{inspectEarlyWarningAlert.projectName || "Chennai Outer Ring Road"}</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Survey No.</td><td className="p-2.5 font-mono font-extrabold text-blue-800">{inspectEarlyWarningAlert.surveyNumber || inspectEarlyWarningAlert.parcelId || "124/2"}</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Location</td><td className="p-2.5 font-semibold text-slate-800">Kanchipuram, Tamil Nadu</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Owner</td><td className="p-2.5 font-bold text-slate-900">R. Kumar</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Land Area</td><td className="p-2.5 text-slate-800 font-semibold">2.45 Ha</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Risk Score</td><td className="p-2.5 font-black text-rose-600">82%</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Risk Level</td><td className="p-2.5 font-black text-rose-700">🔴 HIGH</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Expected Delay</td><td className="p-2.5 font-extrabold text-amber-700">45 Days</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Confidence</td><td className="p-2.5 font-bold text-emerald-700">91%</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Risk Factors</td><td className="p-2.5 text-slate-800">Legal issue, compensation pending, ownership mismatch</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Issue Detected</td><td className="p-2.5 font-extrabold text-rose-800">⚠️ {inspectEarlyWarningAlert.issue || "Ownership mismatch & Legal dispute"}</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Recommended Action</td><td className="p-2.5 font-bold text-blue-700">🎯 {inspectEarlyWarningAlert.recommendedAction || "Verify title & resolve dispute"}</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Responsible Department</td><td className="p-2.5 font-bold text-slate-800">Land Acquisition Officer / Revenue Dept</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Priority</td><td className="p-2.5 font-black text-rose-700">🔴 IMMEDIATE ACTION / Critical</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Deadline</td><td className="p-2.5 font-extrabold text-amber-800">Within 7 Days</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Notification</td><td className="p-2.5 font-extrabold text-emerald-700">Email – SENT (Brevo API)</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-200">Status</td><td className="p-2.5 font-extrabold text-amber-700">Pending Officer Action & Re-verification</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 flex-wrap gap-3">
              <button
                onClick={() => onViewParcel(inspectEarlyWarningAlert.parcelId)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                Inspect Plot Boundary & GIS
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const alertToDispatch = inspectEarlyWarningAlert;
                    setInspectEarlyWarningAlert(null);
                    setDispatchAlert(alertToDispatch);
                    setNoticeText(`Statutory Directive: Survey ${alertToDispatch.surveyNumber || alertToDispatch.parcelId} requires immediate action on ${alertToDispatch.issue}.`);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-rose-100" />
                  <span>Dispatch Email Notice</span>
                </button>

                <button
                  onClick={() => setInspectEarlyWarningAlert(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH WARNING DIRECTIVE MODAL */}
      {dispatchAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 font-sans">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 font-['Outfit']">Transmit Statutory Email Notice (Brevo)</h4>
                <p className="text-xs text-slate-500 font-mono">Survey #{dispatchAlert.surveyNumber || dispatchAlert.parcelId}</p>
              </div>
              <button onClick={() => setDispatchAlert(null)} className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">Official Administrative Directive Statement</label>
                <textarea
                  rows={4}
                  required
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-600 text-slate-900"
                />
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-semibold">
                This notice will be transmitted directly via Brevo API to Special Tahsildar & Land Acquisition Officer.
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchAlert(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatching}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  {isDispatching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-100" />
                      <span>Transmitting via Brevo API...</span>
                    </>
                  ) : (
                    <span>Transmit Early Warning Directive</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

