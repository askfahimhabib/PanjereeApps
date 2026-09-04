import { Hash, GraduationCap, Phone, MapPin, MessageCircle } from 'lucide-react'
import type { Student } from '../../types'
import { GENDER_LABELS, GROUP_LABELS } from '../../types'

export function ProfileTab({ student }: { student: Student }) {
  const handleWhatsApp = (mobile?: string) => {
    if (!mobile) return
    const cleanNumber = mobile.replace(/[^0-9]/g, '')
    const url = `https://wa.me/${cleanNumber.startsWith('88') ? cleanNumber : `88${cleanNumber}`}?text=Assalamu%20Alaikum,%20regarding%20student%20${encodeURIComponent(student.fullNameEn)}.`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Student Personal Identity Card ────────────────────── */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100">
          <div className="p-2 rounded-xl bg-zinc-100 text-zinc-700">
            <Hash size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Personal Identity & Demographics</h3>
            <p className="text-[11px] text-zinc-500">Official identity records on file</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-zinc-500 font-medium">Full Name (English)</span>
            <p className="font-bold text-zinc-900 mt-0.5">{student.fullNameEn}</p>
          </div>
          {student.fullNameBn && (
            <div>
              <span className="text-zinc-500 font-medium">Full Name (Bangla)</span>
              <p className="font-bold text-zinc-900 mt-0.5">{student.fullNameBn}</p>
            </div>
          )}
          <div>
            <span className="text-zinc-500 font-medium">Gender</span>
            <p className="font-bold text-zinc-900 mt-0.5">{student.gender ? GENDER_LABELS[student.gender] : '—'}</p>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Date of Birth</span>
            <p className="font-bold text-zinc-900 mt-0.5 font-mono">
              {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </p>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Blood Group</span>
            <p className="font-bold text-rose-600 mt-0.5 font-mono">{student.bloodGroup || 'Not Specified'}</p>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Religion</span>
            <p className="font-bold text-zinc-900 mt-0.5">{student.religion || 'Islam'}</p>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Nationality</span>
            <p className="font-bold text-zinc-900 mt-0.5">{student.nationality || 'Bangladeshi'}</p>
          </div>
        </div>
      </div>

      {/* ── 2. Academic Enrollment Dossier Card ─────────────────── */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100">
          <div className="p-2 rounded-xl bg-zinc-100 text-zinc-700">
            <GraduationCap size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Academic Enrollment & Placement</h3>
            <p className="text-[11px] text-zinc-500">Class placement and curriculum details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-zinc-500 font-medium">Enrolled Class</span>
            <p className="font-bold text-zinc-900 mt-0.5">{student.className || 'Class —'}</p>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Section</span>
            <p className="font-bold text-zinc-900 mt-0.5">{student.sectionName ? `Section ${student.sectionName}` : 'A'}</p>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Class Roll Number</span>
            <p className="font-bold text-zinc-900 font-mono mt-0.5">{student.rollNumber}</p>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Student ID</span>
            <p className="font-bold text-indigo-700 font-mono mt-0.5">{student.studentId || student.id}</p>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Registration Number</span>
            <p className="font-bold text-zinc-900 font-mono mt-0.5">{student.registrationNumber || '—'}</p>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Academic Group</span>
            <p className="font-bold text-zinc-900 mt-0.5">{student.groupId ? (GROUP_LABELS[student.groupId] || student.groupId) : 'General'}</p>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Class Shift</span>
            <p className="font-bold text-zinc-900 mt-0.5">{student.shift ? student.shift.charAt(0) + student.shift.slice(1).toLowerCase() : 'Morning'}</p>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Language Medium</span>
            <p className="font-bold text-zinc-900 mt-0.5">{student.version ? student.version.charAt(0) + student.version.slice(1).toLowerCase() + ' Medium' : 'Bangla Medium'}</p>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Academic Session</span>
            <p className="font-bold text-zinc-900 font-mono mt-0.5">{student.session || '2024'}</p>
          </div>
          {student.admissionDate && (
            <div>
              <span className="text-zinc-500 font-medium">Admission Date</span>
              <p className="font-bold text-zinc-900 font-mono mt-0.5">
                {new Date(student.admissionDate).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}
          {student.admissionNumber && (
            <div>
              <span className="text-zinc-500 font-medium">Admission Number</span>
              <p className="font-bold text-zinc-900 font-mono mt-0.5">{student.admissionNumber}</p>
            </div>
          )}
          {student.previousSchool && (
            <div>
              <span className="text-zinc-500 font-medium">Previous School</span>
              <p className="font-bold text-zinc-900 mt-0.5">{student.previousSchool}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Parents & Family Contact Cards ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Father Card */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Father's Information</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Primary Guardian
              </span>
            </div>
            <p className="text-base font-extrabold text-zinc-900">{student.father?.name || '—'}</p>
            <p className="text-xs text-zinc-500 mt-1">Occupation: <strong className="text-zinc-700">{student.father?.occupation || '—'}</strong></p>
          </div>

          {student.father?.mobile && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100">
              <a
                href={`tel:${student.father.mobile}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-800 text-xs font-bold hover:bg-zinc-200 transition-colors"
              >
                <Phone size={13} /> {student.father.mobile}
              </a>
              <button
                onClick={() => handleWhatsApp(student.father?.mobile)}
                className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="WhatsApp Father"
              >
                <MessageCircle size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Mother Card */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Mother's Information</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Parent
              </span>
            </div>
            <p className="text-base font-extrabold text-zinc-900">{student.mother?.name || '—'}</p>
            <p className="text-xs text-zinc-500 mt-1">Occupation: <strong className="text-zinc-700">{student.mother?.occupation || '—'}</strong></p>
          </div>

          {student.mother?.mobile && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100">
              <a
                href={`tel:${student.mother.mobile}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-800 text-xs font-bold hover:bg-zinc-200 transition-colors"
              >
                <Phone size={13} /> {student.mother.mobile}
              </a>
              <button
                onClick={() => handleWhatsApp(student.mother?.mobile)}
                className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="WhatsApp Mother"
              >
                <MessageCircle size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Residential Address & Contact Card ──────────────── */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100">
          <div className="p-2 rounded-xl bg-zinc-100 text-zinc-700">
            <MapPin size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Residential & Emergency Contact</h3>
            <p className="text-[11px] text-zinc-500">Physical address for official communication</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-zinc-500 font-medium">Present Residence Address</span>
            <p className="font-semibold text-zinc-900 mt-1 leading-relaxed">{student.presentAddress || '—'}</p>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Permanent Village / Home Address</span>
            <p className="font-semibold text-zinc-900 mt-1 leading-relaxed">{student.permanentAddress || student.presentAddress || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
