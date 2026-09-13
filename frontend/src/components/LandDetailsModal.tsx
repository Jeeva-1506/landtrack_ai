import React from "react";
import { LandParcel } from "../types";
import { 
  X, 
  MapPin, 
  User, 
  FileText, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Edit3, 
  Calendar, 
  DollarSign, 
  Users, 
  Layers, 
  Scale, 
  ExternalLink,
  Building2,
  Clock
} from "lucide-react";

interface LandDetailsModalProps {
  parcel: LandParcel | null;
  onClose: () => void;
  onEdit?: (parcel: LandParcel) => void;
}

export default function LandDetailsModal({ parcel, onClose, onEdit }: LandDetailsModalProps) {
  if (!parcel) return null;

  const handleDownloadPdf = () => {
    const url = `/api/reports/land/${encodeURIComponent(parcel.id)}`;
    window.open(url, "_blank");
  };

  const risk = parcel.riskLevel || "Low";
  const delayDays = parcel.predictedDelayDays || parcel.delayDays || 0;
  const compStatus = parcel.compensationStatus || "Pending";

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up my-auto">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Land Record Dossier
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ID: {parcel.id}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
                Survey #{parcel.surveyNumber || parcel.id}
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{parcel.location || `${parcel.district}, ${parcel.state || 'Tamil Nadu'}`}</span>
                <span className="text-slate-500">•</span>
                <span className="text-blue-300 font-bold">Corridor: {parcel.projectId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all cursor-pointer z-10 shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* TOP HIGHLIGHT RISK BANNER */}
          <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            risk === 'High' || risk === 'Critical'
              ? "bg-rose-50 border-rose-200 text-rose-950"
              : risk === 'Medium'
                ? "bg-amber-50 border-amber-200 text-amber-950"
                : "bg-emerald-50 border-emerald-200 text-emerald-950"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                risk === 'High' || risk === 'Critical'
                  ? "bg-rose-600 text-white"
                  : risk === 'Medium'
                    ? "bg-amber-600 text-white"
                    : "bg-emerald-600 text-white"
              }`}>
                {risk === 'High' || risk === 'Critical' ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : risk === 'Medium' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
                  AI Risk Classification & Delay Forecast
                </span>
                <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <span>{risk.toUpperCase()} RISK LEVEL</span>
                  <span className="text-sm font-semibold opacity-90">({parcel.delayProbability || parcel.riskScore || 20}% Probability)</span>
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-inherit shrink-0">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Forecasted Delay</span>
                <span className="text-lg font-black text-rose-700 font-['Outfit']">{delayDays} Days</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Acquisition Stage</span>
                <span className="text-xs font-extrabold text-slate-900">{parcel.acquisitionStage || "Verification"}</span>
              </div>
            </div>
          </div>

          {/* GRID OF DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* CARD 1: LAND & LOCATION OVERVIEW */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4" />
                <span>1. Land & Location Identification</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Survey Number</span>
                  <strong className="text-slate-900 text-sm font-mono">{parcel.surveyNumber || "124/2"}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Parcel Unique ID</span>
                  <strong className="text-slate-900 font-mono">{parcel.id}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">District & State</span>
                  <span className="text-slate-800 font-bold">{parcel.district}, {parcel.state || "Tamil Nadu"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Corridor Project ID</span>
                  <span className="text-blue-700 font-bold">{parcel.projectId}</span>
                </div>
                {parcel.latitude && parcel.longitude && (
                  <div className="col-span-2 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 font-mono text-[11px] text-blue-900">
                    <span className="font-bold text-blue-700 block text-[10px] uppercase">Exact GIS Coordinates:</span>
                    <span>Lat: {parcel.latitude.toFixed(6)}° N | Lng: {parcel.longitude.toFixed(6)}° E</span>
                  </div>
                )}
              </div>
            </div>

            {/* CARD 2: LAND CHARACTERISTICS & USE */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-sm border-b border-slate-100 pb-2">
                <Layers className="w-4 h-4" />
                <span>2. Land Area & Classification</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Area</span>
                  <strong className="text-slate-900 text-sm font-['Outfit']">{parcel.landArea || parcel.area} {parcel.areaUnit || "Acres"}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Land Use Type</span>
                  <span className="text-slate-800 font-bold">{parcel.landType || parcel.landUse || "Agricultural"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Acquisition Stage</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-extrabold text-[11px] border border-indigo-100">
                    {parcel.acquisitionStage || "LEGAL_VERIFICATION"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Distance From Project Center</span>
                  <span className="text-slate-800 font-bold">{parcel.distanceFromProject ? `${parcel.distanceFromProject} KM` : "4.8 KM"}</span>
                </div>
              </div>
            </div>

            {/* CARD 3: OWNER & REVENUE DOCUMENTATION */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm border-b border-slate-100 pb-2">
                <User className="w-4 h-4" />
                <span>3. Owner & Title Documentation</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Primary Landowner Name</span>
                  <strong className="text-slate-900 text-sm">{parcel.ownerName || "R. Subramani & Bros"}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Number of Owners</span>
                  <span className="text-slate-800 font-bold">{parcel.ownersCount || 1} Person(s)</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Ownership Status</span>
                  <span className="text-slate-800 font-bold">{parcel.ownershipStatus || (parcel.ownershipDispute ? "Joint / Disputed" : "Clear Title")}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Patta / Document Verification</span>
                  <span className={`px-2 py-1 rounded-md text-[11px] font-extrabold inline-block mt-0.5 ${
                    parcel.documentStatus === 'Verified' || parcel.documentsComplete
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {parcel.documentStatus || (parcel.documentsComplete ? "Verified Complete" : "Pending Verification")}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 4: LEGAL & DISPUTE ASSESSMENT */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-purple-700 font-extrabold text-sm border-b border-slate-100 pb-2">
                <Scale className="w-4 h-4" />
                <span>4. Legal & Litigation Assessment</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Legal Dispute</span>
                  <span className={`px-2 py-0.5 rounded font-extrabold text-[11px] ${
                    parcel.courtCase || parcel.legalDispute ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {parcel.courtCase || parcel.legalDispute ? "Active Court Dispute" : "No Court Cases"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Court Case Count</span>
                  <span className="text-slate-800 font-bold">{parcel.courtCaseCount || (parcel.courtCase ? 1 : 0)} Case(s)</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Planned Acquisition Days</span>
                  <span className="text-slate-800 font-bold">{parcel.plannedDays || 60} Days</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Actual Days Elapsed</span>
                  <span className="text-slate-800 font-bold">{parcel.actualDays || 80} Days</span>
                </div>
              </div>
            </div>

            {/* CARD 5: FINANCIAL COMPENSATION & R&R */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 md:col-span-2">
              <div className="flex items-center gap-2 text-amber-700 font-extrabold text-sm border-b border-slate-100 pb-2">
                <DollarSign className="w-4 h-4" />
                <span>5. Financial Compensation & Resettlement (R&R) Breakdown</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Compensation Status</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold inline-block mt-1 ${
                    compStatus === 'Paid' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {compStatus}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Assessed</span>
                  <strong className="text-slate-900 text-sm font-['Outfit'] block mt-0.5">₹{(parcel.compensationAmount || 0).toLocaleString()}</strong>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Amount Paid</span>
                  <strong className="text-emerald-800 text-sm font-['Outfit'] block mt-0.5">₹{(parcel.amountPaid || 0).toLocaleString()}</strong>
                </div>
                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200">
                  <span className="text-[10px] font-bold text-rose-700 uppercase block">Amount Pending</span>
                  <strong className="text-rose-800 text-sm font-['Outfit'] block mt-0.5">
                    ₹{(parcel.amountPending !== undefined ? parcel.amountPending : ((parcel.compensationAmount || 0) - (parcel.amountPaid || 0))).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

          </div>

          {/* STATUTORY RECOMMENDED ACTION BOX */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl text-white shadow-md space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300 block">
              Statutory Mitigating Action Plan & Recommendations
            </span>
            <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-100">
              {parcel.recommendedAction || parcel.primaryDelayFactor
                ? `Fast-track resolution for ${parcel.primaryDelayFactor || 'acquisition'} via Revenue Divisional Inquiry tribunal and Section 15 review.`
                : "Proceed with 3A/3D notification publication, final award inquiry, and compensation disbursement."}
            </p>
          </div>

        </div>

        {/* MODAL FOOTER WITH PDF DOWNLOAD BUTTON */}
        <div className="bg-slate-100 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          {/* PRIMARY PDF DOWNLOAD BUTTON */}
          <button
            onClick={handleDownloadPdf}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2.5 transform active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Official Report</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(parcel);
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Land</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
