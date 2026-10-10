import { useState, useEffect, useRef } from 'react'
import {
  User,
  Users,
  Bell,
  Lock,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Save,
  Laptop,
  Eye,
  EyeOff,
  Sparkles,
  Upload,
  Trash2,
  MessageSquare,
  FileCheck,
  Send,
  X,
  CreditCard,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { useStudentSession } from '@/features/student-portal/hooks/useStudentSession'
import { useTheme } from '@/lib/theme'
import { NavLink } from 'react-router-dom'
import {
  BUILTIN_STICKER_AVATARS,
  getDefaultStickerAvatar,
  getEffectiveStudentAvatar,
  isCustomUploadedPhoto,
  processStudentPhotoFile,
} from '@/lib/studentAvatar'
import { toast } from '@/store/toast'

type TabKey = 'profile' | 'guardians' | 'notifications' | 'security' | 'preferences'

export function StudentSettings() {
  const { student, updateProfile, preferences, updatePreferences } = useStudentSession()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<TabKey>('profile')
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null)

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullNameEn: '',
    fullNameBn: '',
    mobile: '',
    email: '',
    bloodGroup: '',
    gender: '',
    address: '',
    avatar: '',
  })

  // Guardian Form State
  const [guardianForm, setGuardianForm] = useState({
    fatherName: '',
    motherName: '',
    guardianMobile: '',
    emergencyContact: '',
  })

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [portalPin, setPortalPin] = useState(preferences.portalPin || '1234')
  const [sessionsKilled, setSessionsKilled] = useState(false)

  // Photo Upload State & Handlers
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadLoading(true)
    setUploadError(null)
    try {
      const compressedDataUrl = await processStudentPhotoFile(file)
      setProfileForm((prev) => ({ ...prev, avatar: compressedDataUrl }))
      updateProfile({ avatar: compressedDataUrl })
      showToast('ছবি সফলভাবে আপলোড হয়েছে! (Student Photo Uploaded Successfully!)')
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload photo')
    } finally {
      setUploadLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSelectSticker = (stickerUrl: string) => {
    setProfileForm((prev) => ({ ...prev, avatar: stickerUrl }))
    updateProfile({ avatar: stickerUrl })
    showToast('স্টিকার অবতার সিলেক্ট করা হয়েছে! (Sticker Avatar Applied)')
  }

  const handleResetToSticker = () => {
    const defaultSticker = getDefaultStickerAvatar(student.studentId || student.id)
    setProfileForm((prev) => ({ ...prev, avatar: defaultSticker }))
    updateProfile({ avatar: defaultSticker })
    showToast('ডিফল্ট স্টিকারে ফিরে যাওয়া হয়েছে! (Reset to Sticker Avatar)')
  }

  // Correction Request Modal State
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false)
  const [correctionField, setCorrectionField] = useState('NAME')
  const [correctionDetails, setCorrectionDetails] = useState('')
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false)

  // Sync state whenever student changes
  useEffect(() => {
    setProfileForm({
      fullNameEn: student.fullNameEn || '',
      fullNameBn: student.fullNameBn || '',
      mobile: student.mobile || '',
      email: student.email || '',
      bloodGroup: student.bloodGroup || '',
      gender: student.gender || 'MALE',
      address: student.address || '',
      avatar: student.avatar || '',
    })

    setGuardianForm({
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      guardianMobile: student.guardianMobile || '',
      emergencyContact: student.guardianMobile || '',
    })

    setPortalPin(preferences.portalPin || '1234')
  }, [student, preferences.portalPin])

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg)
    setTimeout(() => setSaveSuccessMsg(null), 3500)
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({
      fullNameEn: profileForm.fullNameEn,
      fullNameBn: profileForm.fullNameBn,
      mobile: profileForm.mobile,
      email: profileForm.email,
      bloodGroup: profileForm.bloodGroup,
      gender: profileForm.gender,
      address: profileForm.address,
      avatar: profileForm.avatar,
    })
    showToast('ব্যক্তিগত তথ্য সফলভাবে আপডেট হয়েছে! (Profile Updated Successfully)')
  }

  const handleSaveGuardians = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({
      fatherName: guardianForm.fatherName,
      motherName: guardianForm.motherName,
      guardianMobile: guardianForm.guardianMobile,
    })
    showToast('অভিভাবক ও জরুরি যোগাযোগের তথ্য সংরক্ষিত হয়েছে!')
  }

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      toast.error('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!')
      return
    }
    updatePreferences({ portalPin })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    showToast('পোর্টাল পাসওয়ার্ড এবং সিকিউরিটি পিন সফলভাবে পরিবর্তন করা হয়েছে!')
  }

  const handleKillSessions = () => {
    setSessionsKilled(true)
    showToast('আপনার বর্তমান ডিভাইস ব্যতীত অন্য সব সেশন লগআউট করে দেওয়া হয়েছে!')
  }

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!correctionDetails.trim()) return
    setCorrectionSubmitted(true)
    setTimeout(() => {
      setCorrectionSubmitted(false)
      setCorrectionModalOpen(false)
      setCorrectionDetails('')
      showToast('তথ্য সংশোধনের আবেদন প্রধান অ্যাডমিনের কাছে পাঠানো হয়েছে!')
    }, 1500)
  }

  // Password Strength indicator
  const getPasswordStrength = () => {
    if (!newPassword) return null
    if (newPassword.length < 6) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' }
    if (newPassword.length < 9) return { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-500' }
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' }
  }
  const pwdStrength = getPasswordStrength()

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {saveSuccessMsg && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-600/30 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sliders className="text-emerald-500" size={22} />
            Student Settings & Account Security
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ব্যক্তিগত তথ্য, অভিভাবক যোগাযোগ, এসএমএস প্রেফারেন্স এবং পোর্টাল নিরাপত্তা নিয়ন্ত্রণ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/student/profile"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <CreditCard size={15} />
            View Digital ID
          </NavLink>
          <button
            onClick={() => setCorrectionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold transition-colors hover:bg-emerald-100"
          >
            <FileCheck size={15} />
            তথ্য সংশোধন আবেদন
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User size={15} />
          Profile & Bio
        </button>

        <button
          onClick={() => setActiveTab('guardians')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'guardians'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users size={15} />
          Guardian & Emergency
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell size={15} />
          SMS & Alerts
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock size={15} />
          Security & Password
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles size={15} />
          Display & Privacy
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: PROFILE & BIO
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
            
            {/* Avatar & Photo Picker */}
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Student Profile Photo / Avatar (শিক্ষার্থী ছবি ও অবতার)
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ডিফল্টভাবে কিউট স্টিকার অবতার থাকবে। নিজের ছবি দিতে চাইলে সরাসরি আপলোড করুন।
                  </p>
                </div>

                {isCustomUploadedPhoto(profileForm.avatar) ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    Uploaded Photo Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200/60 dark:border-amber-800/60">
                    <Sparkles size={12} className="text-amber-500" />
                    Default Sticker Avatar
                  </span>
                )}
              </div>

              {/* Main Avatar Card & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                {/* Big Preview */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/50 shadow-md overflow-hidden shrink-0 flex items-center justify-center p-1">
                  <img
                    src={getEffectiveStudentAvatar({ ...student, avatar: profileForm.avatar })}
                    alt="Student Avatar"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  {uploadLoading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold rounded-xl">
                      Uploading...
                    </div>
                  )}
                </div>

                {/* Upload & Reset Buttons */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="student-photo-upload-input"
                    />

                    <button
                      type="button"
                      disabled={uploadLoading}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Upload size={15} />
                      <span>{isCustomUploadedPhoto(profileForm.avatar) ? 'Change Picture / ছবি পরিবর্তন করুন' : 'Upload Picture / ছবি আপলোড করুন'}</span>
                    </button>

                    {isCustomUploadedPhoto(profileForm.avatar) && (
                      <button
                        type="button"
                        onClick={handleResetToSticker}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                        title="Remove uploaded photo and return to sticker"
                      >
                        <Trash2 size={14} />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Supports JPG, PNG or WEBP (Client-side automatic compression, keeps storage fast).
                  </p>

                  {uploadError && (
                    <p className="text-xs text-rose-500 font-medium">{uploadError}</p>
                  )}
                </div>
              </div>

              {/* Preset Sticker Avatars Section */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2.5 flex-wrap gap-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    Or Choose from Built-in Sticker Avatars (স্টিকার অবতার বেছে নিন):
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    (8 Fun Animated Stickers)
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {BUILTIN_STICKER_AVATARS.map((sticker) => {
                    const isSelected = profileForm.avatar === sticker.url
                    return (
                      <button
                        key={sticker.id}
                        type="button"
                        onClick={() => handleSelectSticker(sticker.url)}
                        title={sticker.name}
                        className={`group relative p-1.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-sm scale-105 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 hover:scale-105'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                          <img src={sticker.url} alt={sticker.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-300 truncate max-w-full">
                          {sticker.name}
                        </span>
                        {isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                            ✓
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              
              {/* English Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name (English) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.fullNameEn}
                  onChange={(e) => setProfileForm({ ...profileForm, fullNameEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                />
              </div>

              {/* Bangla Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  সম্পূর্ণ নাম (বাংলায়)
                </label>
                <input
                  type="text"
                  value={profileForm.fullNameBn}
                  onChange={(e) => setProfileForm({ ...profileForm, fullNameBn: e.target.value })}
                  placeholder="যেমন: নাঈম হাসান"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                />
              </div>

              {/* Student Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Student Mobile Number
                </label>
                <input
                  type="tel"
                  value={profileForm.mobile}
                  onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  placeholder="017XX-XXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Student Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Student Email Address
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Blood Group (রক্তের গ্রুপ)
                </label>
                <select
                  value={profileForm.bloodGroup}
                  onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Gender (লিঙ্গ)
                </label>
                <select
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="MALE">Male (ছাত্র)</option>
                  <option value="FEMALE">Female (ছাত্রী)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Present Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Present Residential Address (বর্তমান ঠিকানা)
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="House, Road, Area, Dhaka"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* Readonly Academic Identity Details */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Institutional Academic Credentials (Institutional Readonly)
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                নিরাপত্তার স্বার্থে Student ID, Board Roll এবং Batch তথ্য সরাসরি পরিবর্তনযোগ্য নয়। কোনো ভুল থাকলে উপরে "তথ্য সংশোধন আবেদন" বাটনে ক্লিক করুন।
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-semibold">STUDENT ID</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{student.studentId}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-semibold">CLASS ROLL</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Roll #{student.rollNumber}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-semibold">ENROLLED CLASS</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{student.className || 'N/A'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-semibold">PROGRAM TYPE</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{student.roleType}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-600/20"
              >
                <Save size={15} />
                Save Profile Changes
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: GUARDIAN & EMERGENCY
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'guardians' && (
        <form onSubmit={handleSaveGuardians} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
            
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Parents & Guardian Contact Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                শিক্ষার্থীর অনুপস্থিতি, জরুরি স্বাস্থ্য সমস্যা বা মাসিক বেতন সংক্রান্ত এসএমএস পেতে অভিভাবকের সঠিক নম্বর নিশ্চিত করুন
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Father Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Father's Name (পিতার নাম)
                </label>
                <input
                  type="text"
                  value={guardianForm.fatherName}
                  onChange={(e) => setGuardianForm({ ...guardianForm, fatherName: e.target.value })}
                  placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                />
              </div>

              {/* Mother Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mother's Name (মাতার নাম)
                </label>
                <input
                  type="text"
                  value={guardianForm.motherName}
                  onChange={(e) => setGuardianForm({ ...guardianForm, motherName: e.target.value })}
                  placeholder="যেমন: নাজমা বেগম"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                />
              </div>

              {/* Primary Guardian Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary Guardian Mobile (এসএমএস প্রাপ্তির মূল নম্বর) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={guardianForm.guardianMobile}
                  onChange={(e) => setGuardianForm({ ...guardianForm, guardianMobile: e.target.value })}
                  placeholder="018XX-XXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                />
              </div>

              {/* Emergency Hotline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Emergency Contact Hotline (জরুরি হটলাইন)
                </label>
                <input
                  type="tel"
                  value={guardianForm.emergencyContact}
                  onChange={(e) => setGuardianForm({ ...guardianForm, emergencyContact: e.target.value })}
                  placeholder="019XX-XXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Preferred SMS Recipient */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary SMS Recipient
                </label>
                <select
                  value={preferences.preferredSmsRecipient}
                  onChange={(e) => updatePreferences({ preferredSmsRecipient: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="FATHER">Father (পিতা)</option>
                  <option value="MOTHER">Mother (মাতা)</option>
                  <option value="BOTH">Both Parents (উভয় পিতা-মাতা)</option>
                </select>
              </div>

              {/* Preferred SMS Language */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  SMS Notification Language (মেসেজের ভাষা)
                </label>
                <select
                  value={preferences.smsLanguage}
                  onChange={(e) => updatePreferences({ smsLanguage: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="BN">বাংলা (Bangla Unicode)</option>
                  <option value="EN">English (English SMS)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-600/20"
              >
                <Save size={15} />
                Save Guardian Information
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: SMS & NOTIFICATIONS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Instant SMS & Notification Subscriptions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              কোন কোন একাডেমিক ইভেন্টে অভিভাবকের ফোনে সরাসরি অটোমেটেড এসএমএস যাবে তা নির্বাচন করুন
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Gate Attendance SMS */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone size={16} className="text-emerald-500" />
                  Campus Gate In/Out Attendance SMS
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ছাত্র/ছাত্রী স্কুল বা কোচিং গেটে আরএফআইডি পাঞ্চ করার সাথে সাথে অভিভাবকের ফোনে পৌঁছাবে
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.smsGateAttendance}
                  onChange={(e) => updatePreferences({ smsGateAttendance: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Exam Results SMS */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck size={16} className="text-emerald-500" />
                  Exam Results & Marksheet SMS
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  সাপ্তাহিক মডেল টেস্ট বা টার্ম ফাইনাল পরীক্ষার জিপিএ এবং মার্ক পাবলিশ হওয়ার পর রেজাল্ট এসএমএস
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.smsExamResults}
                  onChange={(e) => updatePreferences({ smsExamResults: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Fee Due Reminders */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-emerald-500" />
                  Monthly Fee & Payment Receipts SMS
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  মাসিক বেতন বকেয়া রিমাইন্ডার এবং বিকাশ/ক্যাশ পেমেন্ট সম্পন্ন হলে তাৎক্ষণিক মানি রিসিট ট্রানজেকশন আইডি
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.smsFeeReminders}
                  onChange={(e) => updatePreferences({ smsFeeReminders: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Routine & Notice Alerts */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell size={16} className="text-emerald-500" />
                  Emergency Notice & Class Cancellation Alert
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  বৃষ্টি বা আবহাওয়ার কারণে হঠাৎ ক্লাস স্থগিত বা গুরুত্বপূর্ণ প্রাতিষ্ঠানিক ছুটির জরুরি নোটিশ
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.smsRoutineChanges}
                  onChange={(e) => updatePreferences({ smsRoutineChanges: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: SECURITY & LOGIN SESSIONS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          
          {/* Password Form */}
          <form onSubmit={handleSavePassword} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock size={16} className="text-emerald-500" />
                Change Student Portal Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                আপনার স্টুডেন্ট অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে শক্তিশালী পাসওয়ার্ড ব্যবহার করুন
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  {pwdStrength && (
                    <span className={`text-[10px] font-bold ${pwdStrength.text} absolute right-3 top-3`}>
                      {pwdStrength.label}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800"
              >
                {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showPasswords ? 'Hide passwords' : 'Show passwords'}</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-600/20"
              >
                <Save size={14} />
                Update Password
              </button>
            </div>
          </form>

          {/* 4-Digit Security PIN & Active Sessions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quick 4-Digit PIN */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                4-Digit Counter Token PIN
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                অফিস কাউন্টারে ক্যাশ জমা দেওয়ার সময় ভাউচার অথেনটিকেশনের জন্য আপনার সিকিউরিটি পিন:
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="password"
                  maxLength={4}
                  value={portalPin}
                  onChange={(e) => setPortalPin(e.target.value)}
                  className="w-28 text-center tracking-widest text-base font-mono font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    updatePreferences({ portalPin })
                    showToast('সিকিউরিটি পিন সফলভাবে সেভ করা হয়েছে!')
                  }}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  Save PIN
                </button>
              </div>
            </div>

            {/* Active Device Sessions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Laptop size={16} className="text-emerald-500" />
                  Active Device Sessions
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {sessionsKilled ? '1 Device' : '2 Devices'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <Laptop size={16} className="text-emerald-500" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Chrome on Windows 11</span>
                      <span className="text-[10px] text-slate-400">Dhaka, Bangladesh • Active Now</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Current</span>
                </div>

                {!sessionsKilled && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex items-center gap-2.5">
                      <Smartphone size={16} className="text-slate-400" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">Samsung Galaxy A54 (Mobile App)</span>
                        <span className="text-[10px] text-slate-400">Dhaka, Bangladesh • 2 hours ago</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleKillSessions}
                disabled={sessionsKilled}
                className="w-full py-2 px-3 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {sessionsKilled ? 'All Other Devices Logged Out' : 'Log Out From All Other Devices'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: DISPLAY, LANGUAGE & PRIVACY
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Display Theme & Academic Privacy Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              পোর্টালের ডিসপ্লে থিম, রুটিনের প্রথম দিন এবং সহপাঠীদের সাথে তথ্য গোপনীয়তা
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Weekly Routine Start Day */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Weekly Class Routine Start Day (সপ্তাহের শুরুর দিন)
              </label>
              <select
                value={preferences.routineStartDay}
                onChange={(e) => updatePreferences({ routineStartDay: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="SATURDAY">Saturday (শনিবার - Standard Bangladesh School)</option>
                <option value="SUNDAY">Sunday (রবিবার)</option>
              </select>
            </div>

            {/* Theme Mode Selector Cards */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Portal Theme Preference (ডিসপ্লে থিম)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  আপনার চোখের আরাম অনুযায়ী লাইট বা ডার্ক মোড বেছে নিন (তাৎক্ষণিক কার্যকর)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Light Mode */}
                <button
                  type="button"
                  onClick={() => {
                    setTheme('light')
                    updatePreferences({ themeMode: 'light' })
                    showToast('Light Theme সক্রিয় করা হয়েছে!')
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center sm:flex-col sm:items-start gap-3.5 cursor-pointer ${
                    theme === 'light'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Sun size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Light Theme</span>
                      {theme === 'light' && <CheckCircle2 size={15} className="text-emerald-500" />}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Clean bright look for daytime study
                    </span>
                  </div>
                </button>

                {/* Dark Mode */}
                <button
                  type="button"
                  onClick={() => {
                    setTheme('dark')
                    updatePreferences({ themeMode: 'dark' })
                    showToast('Dark Theme সক্রিয় করা হয়েছে!')
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center sm:flex-col sm:items-start gap-3.5 cursor-pointer ${
                    theme === 'dark'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Moon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Dark Theme</span>
                      {theme === 'dark' && <CheckCircle2 size={15} className="text-emerald-500" />}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Sleek dark mode for night & low-light
                    </span>
                  </div>
                </button>

                {/* System Mode */}
                <button
                  type="button"
                  onClick={() => {
                    setTheme('system')
                    updatePreferences({ themeMode: 'system' })
                    showToast('System Auto Theme সক্রিয় করা হয়েছে!')
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center sm:flex-col sm:items-start gap-3.5 cursor-pointer ${
                    theme === 'system'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <Monitor size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">System Default</span>
                      {theme === 'system' && <CheckCircle2 size={15} className="text-emerald-500" />}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Matches your device appearance
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Exam Batch Leaderboard Privacy */}
            <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Show Name on Batch Leaderboard
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  মডেল টেস্টের টপ-১০ বা পাবলিক লিডারবোর্ডে আপনার নাম প্রকাশ পাবে
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.leaderboardVisible}
                  onChange={(e) => updatePreferences({ leaderboardVisible: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Phone Visibility to Classmates */}
            <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Share Phone with Classmates
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  ক্লাসের সাবজেক্ট গ্রুপে সহপাঠীরা জরুরি পড়াশোনার প্রয়োজনে আপনার নম্বর দেখতে পাবে
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.phoneVisibleToClass}
                  onChange={(e) => updatePreferences({ phoneVisibleToClass: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: INFORMATION CORRECTION REQUEST (তথ্য সংশোধন আবেদন)
      ───────────────────────────────────────────────────────────── */}
      {correctionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="text-emerald-500" size={20} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  তথ্য সংশোধনের আবেদন (Request Info Correction)
                </h3>
              </div>
              <button
                onClick={() => setCorrectionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                বোর্ড সার্টিফিকেট, জন্মনিবন্ধন বা প্রাতিষ্ঠানিক ফাইলে কোনো ভুল (যেমন: নাম বানান, জন্মতারিখ, রক্তের গ্রুপ) থাকলে সংশোধনের অনুরোধ জানান:
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ভুলের ধরন (Field to Correct)
                </label>
                <select
                  value={correctionField}
                  onChange={(e) => setCorrectionField(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                >
                  <option value="NAME">Full Name Spelling (নামের বানান ভুল)</option>
                  <option value="DOB">Date of Birth (জন্ম তারিখ সংশোধন)</option>
                  <option value="PARENT">Father / Mother Name (পিতা-মাতার নাম)</option>
                  <option value="ROLL">Board Registration / Roll (রেজিস্ট্রেশন নম্বর)</option>
                  <option value="BLOOD">Blood Group (রক্তের গ্রুপ সংশোধন)</option>
                  <option value="OTHER">Other Academic Information (অন্যান্য)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  সঠিক তথ্য ও কারণ (Correct details & Explanation) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={correctionDetails}
                  onChange={(e) => setCorrectionDetails(e.target.value)}
                  placeholder="যেমন: আমার সার্টিফিকেট অনুযায়ী নামের সঠিক বানান 'Md. Nayeem Hasan', কিন্তু পোর্টালে শুধু 'Nayeem Hasan' রয়েছে। অনুগ্রহ করে ঠিক করে দিবেন।"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={correctionSubmitted}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50"
                >
                  {correctionSubmitted ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
