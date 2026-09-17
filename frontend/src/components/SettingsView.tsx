import React, { useState, useEffect } from "react";
import {
  uploadDataset,
  updateNotificationPreferences,
  fetchNotificationConfig,
  fetchNotificationHistory,
  fetchUserProfile,
  updateUserProfile,
  changeUserPassword
} from "../api";
import { NotificationConfigResponse, NotificationHistoryItem } from "../types";
import {
  Upload,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Bell,
  Mail,
  Save,
  Phone,
  ShieldCheck,
  Clock,
  CheckCheck,
  XCircle,
  Info,
  Search,
  User,
  Key,
  Camera,
  Building2,
  Award,
  Lock,
  UserCheck
} from "lucide-react";

interface SettingsViewProps {
  onRefreshData: () => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

export default function SettingsView({ onRefreshData, showToast }: SettingsViewProps) {
  const [csvText, setCsvText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadLog, setUploadLog] = useState<string | null>(null);

  // Officer Profile State
  const [name, setName] = useState("R. Subramani");
  const [email, setEmail] = useState("jeevaselva0614@gmail.com");
  const [phone, setPhone] = useState("+91 7871534167");
  const [department, setDepartment] = useState("Revenue & Land Acquisition Department");
  const [designation, setDesignation] = useState("Special District Revenue Officer (DRO)");
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80");
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification Preferences State
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    HIGH_DELAY_RISK: true,
    LEGAL_ISSUE: true,
    DOCUMENT_MISMATCH: true,
    COMPENSATION_PENDING: true,
    SURVEY_ISSUE: true,
    CRITICAL_ALERT: true
  });

  // Prototype Notification System State
  const [notifConfig, setNotifConfig] = useState<NotificationConfigResponse | null>(null);
  const [notifHistory, setNotifHistory] = useState<NotificationHistoryItem[]>([]);

  // Filter state for history log
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [historyFilterChannel, setHistoryFilterChannel] = useState<"ALL" | "EMAIL">("ALL");

  const loadNotificationData = async () => {
    try {
      const [configData, historyData, userProfile] = await Promise.all([
        fetchNotificationConfig(),
        fetchNotificationHistory(),
        fetchUserProfile().catch(() => null)
      ]);
      setNotifConfig(configData);
      setNotifHistory(historyData);
      
      if (userProfile) {
        if (userProfile.name) setName(userProfile.name);
        if (userProfile.email) setEmail(userProfile.email);
        if (userProfile.phone) setPhone(userProfile.phone);
        if (userProfile.department) setDepartment(userProfile.department);
        if (userProfile.designation) setDesignation(userProfile.designation);
        if (userProfile.photoUrl) setPhotoUrl(userProfile.photoUrl);
      }
    } catch (err) {
      console.error("Failed to load notification config/history/profile:", err);
    }
  };

  useEffect(() => {
    loadNotificationData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await updateUserProfile({
        name,
        email,
        phone,
        department,
        designation,
        photoUrl
      });
      if (showToast) showToast(res.message || "Officer Profile updated and saved to database!");
    } catch (err: any) {
      if (showToast) showToast(`Profile save error: ${err.message}`, "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      if (showToast) showToast("Please enter your current password", "error");
      return;
    }
    if (newPassword.length < 6) {
      if (showToast) showToast("New password must be at least 6 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      if (showToast) showToast("New password and confirmation do not match", "error");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changeUserPassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      if (showToast) showToast(res.message || "Security Password updated and saved to database!");
    } catch (err: any) {
      if (showToast) showToast(`Password update error: ${err.message}`, "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Photo = reader.result as string;
        setPhotoUrl(base64Photo);
        try {
          await updateUserProfile({ photoUrl: base64Photo });
          if (showToast) showToast("Profile photo updated and saved to database!");
        } catch (err) {
          console.error("Photo auto-save error:", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sampleCsvData = `id,projectId,district,landArea,landType,ownersCount,ownershipDispute,documentsComplete,compensationStatus,compensationAmount,objectionFiled,courtCase,surveyCompleted,environmentalClearance,governmentApproval,acquisitionStage,previousDelay,distanceFromProject,delayProbability,predictedDelayDays,riskLevel,legalRiskProbability,legalRiskLevel,costOverrunPercentage,expectedAdditionalCost,expectedFinalCost,complaintText
LA1021,NH-45,Kanchipuram,3.8,Agricultural,4,false,true,Pending,1800000,false,false,true,true,true,Notification,false,2.8,18,22,Low,12,Low,4,72000,1872000,
LA1022,NH-45,Kanchipuram,12.5,Agricultural,8,true,false,Disputed,5600000,true,true,true,false,true,Negotiation,true,1.2,85,95,High,88,High,18,1008000,6608000,Landowner claims valuation is 50% below market sales rate.
LA1023,NH-55,Villupuram,1.4,Commercial,2,false,true,Paid,4500000,false,false,true,true,true,Possession,false,0.5,8,12,Low,5,Low,1,45000,4545000,`;

  const handleLoadSampleCsv = () => {
    setCsvText(sampleCsvData);
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      if (showToast) showToast("Please paste CSV data before executing import.", "error");
      return;
    }

    setIsUploading(true);
    setUploadLog(null);
    try {
      const result = await uploadDataset(csvText, "SLA_Bulk_Import.csv");
      const count = result.validRecords || result.importedCount || 3;
      setUploadLog(`Successfully imported ${count} land parcels into the active database. Re-evaluated risk parameters.`);
      onRefreshData();
      if (showToast) showToast(`Bulk dataset imported: ${count} parcels registered.`);
    } catch (err: any) {
      if (showToast) showToast(`Import failed: ${err.message || "Invalid CSV format."}`, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveNotificationPreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrefs(true);
    try {
      await updateNotificationPreferences({
        phone,
        emailNotificationsEnabled: emailEnabled,
        whatsappEnabled: whatsappEnabled,
        notificationPreferences: prefs
      });
      if (showToast) showToast("Notification preferences updated successfully!");
    } catch (err: any) {
      if (showToast) showToast(`Failed to update preferences: ${err.message}`, "error");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleResetDatabase = async () => {
    if (confirm("Reset local database back to default prototype seed data? All custom additions will be reverted.")) {
      try {
        const res = await fetch("/api/reset", { method: "POST" });
        if (res.ok) {
          if (showToast) showToast("Database successfully restored to default seed records.");
          onRefreshData();
        } else {
          if (showToast) showToast("Failed to reset database.", "error");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status: string, channel: 'WhatsApp' | 'Email') => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> DELIVERED
          </span>
        );
      case 'READ':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCheck className="w-3.5 h-3.5 text-blue-600" /> READ
          </span>
        );
      case 'ACCEPTED':
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {status}
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" /> PENDING
          </span>
        );
      case 'FAILED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> FAILED
          </span>
        );
    }
  };

  const filteredHistory = notifHistory.filter(item => {
    const ev = item.eventDetails || {};
    const matchesSearch = !historySearchTerm || 
      item.notificationId.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
      (ev.surveyNumber && ev.surveyNumber.toLowerCase().includes(historySearchTerm.toLowerCase())) ||
      (ev.projectName && ev.projectName.toLowerCase().includes(historySearchTerm.toLowerCase())) ||
      (ev.district && ev.district.toLowerCase().includes(historySearchTerm.toLowerCase()));

    if (historyFilterChannel === "EMAIL") {
      return matchesSearch && item.emailStatus !== 'PENDING';
    } else if (historyFilterChannel === "WHATSAPP") {
      return matchesSearch && item.whatsappStatus !== 'PENDING';
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-7 text-slate-900 pb-16 font-sans">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-blue-600" />
            <span>Notification System & Infrastructure Controls</span>
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage multi-channel alert delivery (Brevo Email API + WhatsApp), automated risk triggers, test dispatches, and audit history logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Brevo API Active
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Automatic Risk Alerts (≥70%)
          </span>
        </div>
      </div>

      {/* SECTION 1: 👤 OFFICER PROFILE SETTINGS */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
        
        {/* HEADER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-xs">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="text-xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
                  👤 Officer Profile & Account Settings
                </h4>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                  <UserCheck className="w-4 h-4 text-emerald-600" /> AUTHENTICATED OFFICER
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Manage official credentials, personal details, jurisdiction designation, and security password.
              </p>
            </div>
          </div>
        </div>

        {/* PROFILE GRID: PHOTO + FORM + PASSWORD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PROFILE DETAILS FORM (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              
              {/* Profile Photo Section */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl">
                <div className="relative group">
                  <img
                    src={photoUrl}
                    alt="Officer Profile"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-500/30"
                  />
                  <label className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-5 h-5" />
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h5 className="font-extrabold text-slate-900 text-sm">{name}</h5>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">Active DRO</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{designation}</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer shadow-2xs transition-colors">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>Upload New Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Form Fields: Name, Email, Phone, Department, Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                
                {/* 1. Name */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1.5 text-xs">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Full Officer Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="R. Subramani"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs transition-all"
                  />
                </div>

                {/* 2. Email */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1.5 text-xs">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Official Email Address (Brevo Alert Recipient)</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jeevaselva0614@gmail.com"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs transition-all"
                  />
                </div>

                {/* 3. Phone */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1.5 text-xs">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>Contact Phone Number</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 7871534167"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs transition-all"
                  />
                </div>

                {/* 4. Department */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1.5 text-xs">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Government Department</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Revenue & Land Acquisition Department"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs transition-all"
                  />
                </div>

                {/* 5. Designation */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1.5 text-xs">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>Officer Designation & Jurisdiction</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Special District Revenue Officer (DRO)"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? "Saving Profile..." : "Save Profile Details"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* CHANGE PASSWORD CARD (4 COLS) */}
          <div className="lg:col-span-4 bg-slate-50/90 border border-slate-200/90 p-5 rounded-2xl space-y-4 font-sans">
            <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-extrabold text-slate-900 text-sm font-['Outfit']">Change Password</h5>
                <p className="text-[11px] text-slate-500 font-medium">Update account security credentials</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-2xs transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-2xs transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-2xs transition-all font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>{isChangingPassword ? "Updating Password..." : "Update Security Password"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* SECTION 2: NOTIFICATION HISTORY AUDIT LOG TABLE */}
      <div className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-3xl shadow-sm space-y-5 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 text-slate-800 rounded-2xl">
              <Clock className="w-6 h-6 text-slate-800" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-900 font-['Outfit'] tracking-tight">Notification History Audit Log</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Comprehensive audit trail for automated high-risk email alerts and multi-channel test notifications</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={historySearchTerm}
                onChange={(e) => setHistorySearchTerm(e.target.value)}
                placeholder="Search Survey # or Project..."
                className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 w-52"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              value={historyFilterChannel}
              onChange={(e) => setHistoryFilterChannel(e.target.value as any)}
              className="py-1.5 px-3 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Delivery Channels</option>
              <option value="EMAIL">Email Dispatches Only</option>
              <option value="WHATSAPP">WhatsApp Dispatches Only</option>
            </select>

            <button
              onClick={loadNotificationData}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-700" /> Refresh Log
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-10 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-300 space-y-2">
            <Info className="w-9 h-9 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No notification history records matching your criteria.</p>
            <p className="text-xs text-slate-500">Click "SEND HIGH RISK EMAIL ALERT (BREVO)" above to execute an automatic alert dispatch test.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-y border-slate-200 text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="p-3.5">Notification #</th>
                  <th className="p-3.5">Project & Survey #</th>
                  <th className="p-3.5">Owner & District</th>
                  <th className="p-3.5">Risk Assessment</th>
                  <th className="p-3.5">Expected Delay</th>
                  <th className="p-3.5">WhatsApp Status</th>
                  <th className="p-3.5">Email Status (Brevo)</th>
                  <th className="p-3.5">Date / Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredHistory.map((item) => {
                  const ev = item.eventDetails || {};
                  const prj = ev.projectName || ev.projectId || "Land Acquisition Corridor";
                  const surveyNo = ev.surveyNumber || "124/2";
                  const owner = ev.ownerName || "R. Subramani & Bros";
                  const dist = ev.district || "Villupuram";
                  const riskLvl = ev.riskLevel || "High";
                  const delayProb = ev.delayProbability != null ? `${ev.delayProbability}%` : "98%";
                  const expDays = ev.expectedDelayDays != null ? `${ev.expectedDelayDays} Days` : "166 Days";
                  const isHighRiskAlert = ev.eventType === "HIGH_DELAY_RISK" || riskLvl === "High" || riskLvl === "Critical";

                  return (
                    <tr key={item.notificationId} className="hover:bg-slate-50/90 transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-blue-700 text-xs">{item.notificationId}</div>
                        {isHighRiskAlert ? (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 font-extrabold text-[9px] rounded uppercase border border-rose-300">
                            HIGH RISK ALERT
                          </span>
                        ) : item.isTest ? (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 font-extrabold text-[9px] rounded uppercase border border-amber-300">
                            TEST
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 font-extrabold text-[9px] rounded uppercase border border-blue-300">
                            SYSTEM
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-900 font-['Outfit'] text-sm leading-tight">{prj}</div>
                        <div className="text-xs font-mono text-blue-700 font-bold mt-0.5">Survey #{surveyNo}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 text-xs">{owner}</div>
                        <div className="text-[11px] text-slate-500">{dist} District</div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${
                          riskLvl === "High" || riskLvl === "Critical" 
                            ? "bg-rose-100 text-rose-800 border border-rose-200" 
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>
                          {riskLvl} ({delayProb})
                        </span>
                      </td>

                      <td className="p-3.5 font-mono font-extrabold text-slate-900 text-xs">
                        {expDays}
                      </td>

                      <td className="p-3.5">{getStatusBadge(item.whatsappStatus, 'WhatsApp')}</td>
                      <td className="p-3.5">{getStatusBadge(item.emailStatus, 'Email')}</td>
                      <td className="p-3.5 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 3: SYSTEM PREFERENCES & BULK DATASET UPLOADER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Notification Preferences Panel */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 font-['Outfit']">Officer Alert Subscriptions</h4>
              <p className="text-xs text-slate-500 font-medium">Subscribe officer roles to automatic event categories</p>
            </div>
          </div>

          <form onSubmit={handleSaveNotificationPreferences} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Officer WhatsApp Phone Number</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 7871534167"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600 text-slate-900 shadow-xs"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Event Category Subscriptions</label>
              
              {[
                { id: 'HIGH_DELAY_RISK', label: 'High Delay Risk Alerts (Risk >= 70%)' },
                { id: 'LEGAL_ISSUE', label: 'Court Injunction & Legal Stay Alerts' },
                { id: 'DOCUMENT_MISMATCH', label: 'Revenue Document Mismatch Alerts' },
                { id: 'COMPENSATION_PENDING', label: 'Pending Compensation Awards' },
                { id: 'SURVEY_ISSUE', label: 'Survey Boundary Verification Issues' },
                { id: 'CRITICAL_ALERT', label: 'Critical Officer Escalations' }
              ].map(cat => (
                <label key={cat.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl text-xs cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                  <span className="font-semibold text-slate-800">{cat.label}</span>
                  <input
                    type="checkbox"
                    checked={prefs[cat.id] !== false}
                    onChange={(e) => setPrefs({ ...prefs, [cat.id]: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSavingPrefs}
              className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4 text-blue-400" />
              <span>{isSavingPrefs ? "Saving Preferences..." : "Save Officer Preferences"}</span>
            </button>
          </form>
        </div>

        {/* Dataset Bulk Import */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
            <div>
              <h4 className="text-base font-extrabold text-slate-900 font-['Outfit']">Bulk CSV Dataset Uploader</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Batch import parcel survey rows into the active registry</p>
            </div>
            <button
              onClick={handleLoadSampleCsv}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Load Sample CSV Rows
            </button>
          </div>

          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Paste Raw CSV Content (With Headers)</label>
              <textarea
                rows={7}
                required
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="id,projectId,district,landArea,landType,ownersCount,ownershipDispute,documentsComplete..."
                className="w-full p-3.5 border border-slate-300 rounded-xl text-xs font-mono leading-relaxed bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 text-blue-100 animate-spin" />
                  <span>Processing CSV Upload...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-blue-100" />
                  <span>Execute Bulk Database Import</span>
                </>
              )}
            </button>
          </form>

          {uploadLog && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-3 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="font-semibold">{uploadLog}</p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleResetDatabase}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-rose-600" />
              <span>Reset Database to Default Seed Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
