import { useState, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import {
  User,
  CreditCard,
  Printer,
  QrCode,
  ShieldCheck,
  Settings,
  Camera,
  Upload,
  Trash2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { useStudentSession } from '@/features/student-portal/hooks/useStudentSession'
import { getInstitutionInfo } from '@/lib/institutionInfo'
import {
  getEffectiveStudentAvatar,
  isCustomUploadedPhoto,
  getDefaultStickerAvatar,
  processStudentPhotoFile,
} from '@/lib/studentAvatar'
import { toast } from '@/store/toast'

export function StudentProfile() {
  const { student, updateProfile } = useStudentSession()
  const [idCardSide, setIdCardSide] = useState<'FRONT' | 'BACK'>('FRONT')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const institution = getInstitutionInfo()

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      const dataUrl = await processStudentPhotoFile(file)
      updateProfile({ avatar: dataUrl })
      setUploadMsg('ছবি সফলভাবে আইডি কার্ডে আপডেট হয়েছে!')
      toast.success('ছবি সফলভাবে আইডি কার্ডে আপডেট হয়েছে!')
      setTimeout(() => setUploadMsg(null), 3500)
    } catch (err: any) {
      toast.error(err.message || 'ছবি আপলোড করতে সমস্যা হয়েছে')
    } finally {
      setPhotoUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleResetToSticker = () => {
    const sticker = getDefaultStickerAvatar(student.studentId || student.id)
    updateProfile({ avatar: sticker })
    setUploadMsg('স্টিকার অবতারে পরিবর্তন করা হয়েছে!')
    setTimeout(() => setUploadMsg(null), 3500)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="text-emerald-500" size={22} />
            Digital ID Card & Student Profile
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official institutional identity credentials and emergency guardian details
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <NavLink
            to="/student/settings"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <Settings size={15} className="text-slate-500" />
            Edit Profile in Settings
          </NavLink>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <Printer size={15} />
            Print ID Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Digital PVC Smart ID Card (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Student ID Pass (PVC Card)
            </span>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setIdCardSide('FRONT')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  idCardSide === 'FRONT'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setIdCardSide('BACK')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  idCardSide === 'BACK'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Back
              </button>
            </div>
          </div>

          {/* Premium Card Container */}
          <div className="relative w-full max-w-sm mx-auto aspect-[1.58/1] rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all select-none">
            {idCardSide === 'FRONT' ? (
              /* FRONT SIDE */
              <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white p-5 flex flex-col justify-between relative">
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                {/* Institution Header */}
                <div className="flex items-center justify-between border-b border-white/20 pb-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white text-emerald-800 flex items-center justify-center font-bold text-xs">
                      LMS
                    </div>
                    <div>
                      <h4 className="font-bold text-[11px] leading-tight tracking-wide">
                        {institution.name.toUpperCase()}
                      </h4>
                      <p className="text-[9px] text-emerald-100/80 truncate max-w-[180px]">
                        {institution.board} • EIIN: {institution.eiin}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                    STUDENT
                  </span>
                </div>

                {/* Photo & Core Information */}
                <div className="flex items-center gap-3.5 relative z-10 my-auto">
                  <div className="relative group w-16 h-20 rounded-xl bg-white/20 border-2 border-white/70 overflow-hidden shrink-0 flex items-center justify-center font-bold text-2xl text-white shadow-md">
                    <img
                      src={getEffectiveStudentAvatar(student)}
                      alt="Student Photo"
                      className="w-full h-full object-cover"
                    />

                    {/* Quick upload overlay on hover */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={photoUploading}
                      className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 text-center"
                      title="Upload Student Photo / ছবি আপলোড করুন"
                    >
                      <Camera size={16} />
                      <span className="text-[7.5px] font-bold mt-0.5 leading-tight">Change</span>
                    </button>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <h3 className="font-bold text-sm truncate">{student.fullNameEn}</h3>
                    {student.fullNameBn && (
                      <p className="text-[10px] text-emerald-200 truncate">{student.fullNameBn}</p>
                    )}
                    <p className="text-[10px] font-mono text-emerald-100">
                      ID: {student.studentId}
                    </p>
                    <p className="text-[11px] text-white font-medium">
                      {student.className ? `${student.className}` : student.batchName}
                      {' • '} Roll: <span className="font-bold text-amber-300">{student.rollNumber}</span>
                    </p>
                    {student.bloodGroup && (
                      <p className="text-[10px] text-rose-200 font-bold">
                        Blood: {student.bloodGroup}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Bottom Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-white/20 relative z-10 text-[9px] text-emerald-100">
                  <span>Session: {institution.session}</span>
                  <span className="font-mono tracking-widest text-[8px] bg-black/25 px-2 py-0.5 rounded">
                    ||||| |||| |||||| ||||
                  </span>
                  <span>Valid: Dec {institution.session}</span>
                </div>
              </div>
            ) : (
              /* BACK SIDE */
              <div className="w-full h-full bg-slate-900 text-white p-5 flex flex-col justify-between relative text-[10px]">
                <div>
                  <h4 className="font-bold text-xs text-emerald-400 border-b border-slate-800 pb-1">
                    EMERGENCY CONTACT & TERMS
                  </h4>
                  <ul className="mt-2 space-y-0.5 text-slate-400 text-[9px] list-disc list-inside">
                    <li>This card is institutional property and non-transferable.</li>
                    <li>If found, please return to {institution.name}.</li>
                    <li>Helpdesk: {institution.phone}</li>
                  </ul>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Guardian Mobile:</span>
                    <span className="font-mono font-bold text-emerald-400">{student.guardianMobile || student.mobile}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Residence:</span>
                    <span className="truncate max-w-[170px] text-right">{student.address || 'Dhaka, Bangladesh'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <QrCode size={24} className="text-white" />
                    <span className="text-[8px] text-slate-500 font-mono">VERIFIED RFID/QR</span>
                  </div>
                  <div className="text-right">
                    <span className="font-script text-emerald-400 italic text-xs block leading-tight">{institution.principal}</span>
                    <span className="text-[8px] text-slate-500">Authorized Signature</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Photo Upload & Sticker Switcher Toolbar for ID Card */}
          <div className="mt-3 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60 flex-wrap text-xs">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <div className="flex items-center gap-2">
              {isCustomUploadedPhoto(student.avatar) ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} />
                  Uploaded Photo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <Sparkles size={13} />
                  Sticker Avatar (Default)
                </span>
              )}
              {uploadMsg && <span className="text-[11px] text-emerald-500 font-medium">({uploadMsg})</span>}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Upload size={12} />
                <span>Upload Picture</span>
              </button>

              {isCustomUploadedPhoto(student.avatar) && (
                <button
                  type="button"
                  onClick={handleResetToSticker}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-700 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                  title="Return to sticker avatar"
                >
                  <Trash2 size={12} />
                  <span>Sticker</span>
                </button>
              )}
            </div>
          </div>
          
          <p className="text-[11px] text-slate-400 text-center">
            Click 'Front' or 'Back' to flip the digital ID card.
          </p>
        </div>

        {/* Right Column: Bio & Guardian Credentials (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Personal Information */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <User size={16} className="text-emerald-600" />
              Student Academic Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Full Name (English)</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{student.fullNameEn}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Full Name (বাংলা)</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{student.fullNameBn || '—'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Student ID & Reg</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {student.studentId} • {student.registrationNumber || 'REG-2026'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Class & Section</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {student.className || student.batchName} ({student.sectionName || 'Sec A'})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Roll Number</span>
                <span className="font-bold text-emerald-600 text-sm">{student.rollNumber}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Blood Group</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{student.bloodGroup || 'B+'}</span>
              </div>
            </div>
          </div>

          {/* Guardian & Contact */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              Guardian & Emergency Contacts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Father's Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">{student.fatherName || 'Md. Rafiqul Islam'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Mother's Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">{student.motherName || 'Nazma Begum'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Guardian Emergency Mobile</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {student.guardianMobile || '01819-876543'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Residential Address</span>
                <span className="text-slate-700 dark:text-slate-300">{student.address || 'Dhanmondi, Dhaka, Bangladesh'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
