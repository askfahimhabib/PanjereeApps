import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Printer,
  Sparkles,
  Sliders,
  Eye,
  Check,
  User,
  Building,
  FileCheck,
} from 'lucide-react'
import type { Student } from '@/features/students/types'
import { studentStore } from '@/data/stores'
import type { CertificateData } from '../types'
import { CERTIFICATE_TYPES, CERTIFICATE_THEMES } from '../types'
import { CertificatePreview } from './CertificatePreview'
import { printCertificate } from '../utils/printCertificate'
import { getInstitutionInfo } from '@/lib/institutionInfo'

interface Props {
  isOpen: boolean
  onClose: () => void
  initialStudent?: Student | null
}

function getDefaultCertificateData(student?: Student | null): CertificateData {
  const inst = getInstitutionInfo()
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const certId = `CERT-${inst.session}-${Math.floor(1000 + Math.random() * 9000)}`

  return {
    id: `cert-${Date.now()}`,
    certificateType: 'GRADUATION',
    theme: 'GOLD',

    studentId: student?.id || '',
    studentNameEn: student?.fullNameEn || 'Md. Sabbir Rahman',
    studentNameBn: student?.fullNameBn || 'মো. সাব্বির রহমান',
    fatherName: student?.father?.name || 'Md. Mizanur Rahman',
    motherName: student?.mother?.name || 'Lovely Begum',
    studentIdCode: student?.studentId || 'STU-2026-013',
    regNumber: student?.registrationNumber || 'REG-2026-013',
    rollNumber: student?.rollNumber || '01',
    classOrBatch: student?.type === 'EXAM_BATCH' ? (student.batchName || 'HSC Batch 2026') : (student?.className || 'Class 10'),
    group: student?.groupId || 'SCIENCE',
    session: student?.session || inst.session,
    gpa: 'GPA 5.00 (Golden A+)',
    conduct: 'Exemplary & Diligent',

    certificateNo: certId,
    issueDate: today,

    institutionName: inst.name,
    institutionTagline: inst.tagline,
    institutionAddress: `${inst.address} • Estd: ${inst.establishedYear} • EIIN: ${inst.eiin}`,

    principalName: inst.principal,
    principalTitle: inst.principalDesignation,
    teacherName: 'Md. Shafiqul Islam',
    teacherTitle: 'Academic Coordinator',

    customRemarks: '',
    showBengali: true,
  }
}

export function CertificateModal({ isOpen, onClose, initialStudent }: Props) {
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [data, setData] = useState<CertificateData>(() => getDefaultCertificateData(initialStudent))
  const [activeTab, setActiveTab] = useState<'TYPE' | 'STUDENT' | 'INSTITUTION' | 'ADVANCED'>('TYPE')
  const [showBengali, setShowBengali] = useState(true)

  // Load students for dropdown selection
  useEffect(() => {
    if (isOpen) {
      const list = studentStore.getAll()
      setAllStudents(list)
      if (initialStudent) {
        setData(getDefaultCertificateData(initialStudent))
      }
    }
  }, [isOpen, initialStudent])

  if (!isOpen) return null

  const handleSelectStudent = (stuId: string) => {
    const found = allStudents.find(s => s.id === stuId)
    if (found) {
      setData(prev => ({
        ...prev,
        studentId: found.id,
        studentNameEn: found.fullNameEn,
        studentNameBn: found.fullNameBn,
        fatherName: found.father?.name || prev.fatherName,
        motherName: found.mother?.name || prev.motherName,
        studentIdCode: found.studentId,
        regNumber: found.registrationNumber || prev.regNumber,
        rollNumber: found.rollNumber,
        classOrBatch: found.type === 'EXAM_BATCH' ? (found.batchName || '') : (found.className || ''),
        session: found.session || prev.session,
      }))
    }
  }

  const handlePrint = () => {
    printCertificate({
      ...data,
      showBengali,
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl w-full max-w-7xl h-[94vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Academic Certificate Generator & Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Vector High-Res
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Issue official certificates, awards & transcripts with tamper-proof security borders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Printer size={16} />
              Print Certificate / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Studio Workspace: 2-Column (Sidebar Controls + Live Canvas Preview) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[400px_1fr] overflow-hidden">
          
          {/* Left Column: Form Controls with Tabs */}
          <div className="border-r border-zinc-800/80 bg-zinc-900/90 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-zinc-800 bg-zinc-950/40 p-1.5 gap-1 shrink-0">
              {[
                { id: 'TYPE', label: 'Type & Theme', icon: Sliders },
                { id: 'STUDENT', label: 'Student Data', icon: User },
                { id: 'INSTITUTION', label: 'Institution', icon: Building },
                { id: 'ADVANCED', label: 'Options', icon: FileCheck },
              ].map(t => {
                const Icon = t.icon
                const active = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-zinc-800 text-amber-300 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Tab Contents (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* TAB 1: TYPE & THEME */}
              {activeTab === 'TYPE' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Certificate Purpose
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {CERTIFICATE_TYPES.map(ct => (
                        <div
                          key={ct.type}
                          onClick={() => setData(prev => ({ ...prev, certificateType: ct.type }))}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                            data.certificateType === ct.type
                              ? 'bg-amber-500/10 border-amber-500/50 text-white'
                              : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-200">{ct.title}</span>
                            {data.certificateType === ct.type && <Check size={14} className="text-amber-400" />}
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{ct.labelBn} • {ct.subtitle}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Color Palette & Border Theme
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CERTIFICATE_THEMES.map(th => (
                        <div
                          key={th.theme}
                          onClick={() => setData(prev => ({ ...prev, theme: th.theme }))}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                            data.theme === th.theme
                              ? 'bg-zinc-800 border-amber-500/60 ring-1 ring-amber-500/40'
                              : 'bg-zinc-950/40 border-zinc-800 hover:bg-zinc-800/30'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                            style={{ background: th.borderColor }}
                          />
                          <span className="text-xs font-medium text-zinc-200">{th.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STUDENT DATA */}
              {activeTab === 'STUDENT' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Quick Load From Enrolled Student
                    </label>
                    <select
                      value={data.studentId}
                      onChange={(e) => handleSelectStudent(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="">-- Select Student (Auto-Fill) --</option>
                      {allStudents.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.fullNameEn} (Roll: {s.rollNumber}, {s.className || s.batchName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Student Name (English)</label>
                      <input
                        type="text"
                        value={data.studentNameEn}
                        onChange={e => setData(prev => ({ ...prev, studentNameEn: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">শিক্ষার্থীর নাম (বাংলা)</label>
                      <input
                        type="text"
                        value={data.studentNameBn}
                        onChange={e => setData(prev => ({ ...prev, studentNameBn: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Father's Name</label>
                      <input
                        type="text"
                        value={data.fatherName}
                        onChange={e => setData(prev => ({ ...prev, fatherName: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Mother's Name</label>
                      <input
                        type="text"
                        value={data.motherName}
                        onChange={e => setData(prev => ({ ...prev, motherName: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Roll No</label>
                      <input
                        type="text"
                        value={data.rollNumber}
                        onChange={e => setData(prev => ({ ...prev, rollNumber: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Class / Batch</label>
                      <input
                        type="text"
                        value={data.classOrBatch}
                        onChange={e => setData(prev => ({ ...prev, classOrBatch: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Session</label>
                      <input
                        type="text"
                        value={data.session}
                        onChange={e => setData(prev => ({ ...prev, session: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">GPA / Division / Grade</label>
                      <input
                        type="text"
                        value={data.gpa}
                        onChange={e => setData(prev => ({ ...prev, gpa: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Conduct & Character</label>
                      <input
                        type="text"
                        value={data.conduct}
                        onChange={e => setData(prev => ({ ...prev, conduct: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INSTITUTION & SIGNATORIES */}
              {activeTab === 'INSTITUTION' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Institution Legal Name</label>
                    <input
                      type="text"
                      value={data.institutionName}
                      onChange={e => setData(prev => ({ ...prev, institutionName: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Motto / Tagline</label>
                    <input
                      type="text"
                      value={data.institutionTagline}
                      onChange={e => setData(prev => ({ ...prev, institutionTagline: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Official Address & Estd</label>
                    <input
                      type="text"
                      value={data.institutionAddress}
                      onChange={e => setData(prev => ({ ...prev, institutionAddress: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Principal Name</label>
                      <input
                        type="text"
                        value={data.principalName}
                        onChange={e => setData(prev => ({ ...prev, principalName: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Principal Designation</label>
                      <input
                        type="text"
                        value={data.principalTitle}
                        onChange={e => setData(prev => ({ ...prev, principalTitle: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ADVANCED OPTIONS */}
              {activeTab === 'ADVANCED' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Certificate Serial No</label>
                      <input
                        type="text"
                        value={data.certificateNo}
                        onChange={e => setData(prev => ({ ...prev, certificateNo: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Issue Date</label>
                      <input
                        type="text"
                        value={data.issueDate}
                        onChange={e => setData(prev => ({ ...prev, issueDate: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Special Recommendation / Custom Text</label>
                    <textarea
                      value={data.customRemarks}
                      onChange={e => setData(prev => ({ ...prev, customRemarks: e.target.value }))}
                      rows={3}
                      placeholder="Optional additional commendation remarks to be printed on certificate..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <div>
                      <span className="text-xs font-bold text-zinc-200">Include Bengali Subtitle</span>
                      <p className="text-[11px] text-zinc-500">Prints Bengali translation of title & name</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={showBengali}
                      onChange={e => setShowBengali(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live High-Resolution Certificate Canvas Preview */}
          <div className="bg-zinc-950 p-6 flex flex-col items-center justify-center overflow-auto relative">
            <div className="absolute top-4 left-6 flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <Eye size={14} />
              <span>Real-time High-Resolution Canvas Preview (A4 Landscape)</span>
            </div>

            <div className="w-full max-w-4xl transform scale-[0.85] origin-center shadow-2xl rounded-sm overflow-hidden my-auto">
              <CertificatePreview data={{ ...data, showBengali }} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
