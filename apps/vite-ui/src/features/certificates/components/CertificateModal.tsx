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

interface Props {
  isOpen: boolean
  onClose: () => void
  initialStudent?: Student | null
}

function getDefaultCertificateData(student?: Student | null): CertificateData {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const certId = `PCC-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

  return {
    id: `cert-${Date.now()}`,
    certificateType: 'GRADUATION',
    theme: 'GOLD',

    studentId: student?.id || '',
    studentNameEn: student?.fullNameEn || 'Md. Sabbir Rahman',
    studentNameBn: student?.fullNameBn || 'মো. সাব্বির রহমান',
    fatherName: student?.father?.name || 'Md. Mizanur Rahman',
    motherName: student?.mother?.name || 'Lovely Begum',
    studentIdCode: student?.studentId || 'STU-2024-013',
    regNumber: student?.registrationNumber || 'REG-2024-013',
    rollNumber: student?.rollNumber || '01',
    classOrBatch: student?.type === 'EXAM_BATCH' ? (student.batchName || 'HSC Batch 2024') : (student?.className || 'Class 12'),
    group: student?.groupId || 'SCIENCE',
    session: student?.session || '2023 - 2024',
    gpa: 'GPA 5.00 (Golden A+)',
    conduct: 'Exemplary & Diligent',

    certificateNo: certId,
    issueDate: today,

    institutionName: 'Panjeree Model Academy & College',
    institutionTagline: 'Center of Academic Excellence & Moral Values',
    institutionAddress: 'House 12, Road 4, Dhanmondi, Dhaka-1209 • Estd: 2014',

    principalName: 'Prof. Dr. Rafiqul Islam',
    principalTitle: 'Principal & Head of Institution',
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
    }
  }, [isOpen])

  // Sync when initialStudent changes
  useEffect(() => {
    if (initialStudent) {
      setData(prev => ({
        ...prev,
        studentId: initialStudent.id,
        studentNameEn: initialStudent.fullNameEn,
        studentNameBn: initialStudent.fullNameBn || '',
        fatherName: initialStudent.father?.name || '',
        motherName: initialStudent.mother?.name || '',
        studentIdCode: initialStudent.studentId,
        regNumber: initialStudent.registrationNumber || '',
        rollNumber: initialStudent.rollNumber || '',
        classOrBatch: initialStudent.type === 'EXAM_BATCH' ? (initialStudent.batchName || 'Batch') : (initialStudent.className || 'Class'),
        group: initialStudent.groupId || '',
        session: initialStudent.session || '2023 - 2024',
      }))
    }
  }, [initialStudent])

  if (!isOpen) return null

  const handleStudentSelect = (studentId: string) => {
    const selected = allStudents.find(s => s.id === studentId)
    if (selected) {
      setData(prev => ({
        ...prev,
        studentId: selected.id,
        studentNameEn: selected.fullNameEn,
        studentNameBn: selected.fullNameBn || '',
        fatherName: selected.father?.name || '',
        motherName: selected.mother?.name || '',
        studentIdCode: selected.studentId,
        regNumber: selected.registrationNumber || '',
        rollNumber: selected.rollNumber || '',
        classOrBatch: selected.type === 'EXAM_BATCH' ? (selected.batchName || 'Batch') : (selected.className || 'Class'),
        group: selected.groupId || '',
        session: selected.session || '2023 - 2024',
      }))
    }
  }

  const handlePrint = () => {
    printCertificate({ ...data, showBengali })
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-7xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* ── Modal Header ── */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-600 flex items-center justify-center shadow-inner">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                Generate Academic Certificate
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold uppercase tracking-wider">
                  Official Document
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                Create, customize and print professional certificates for alumni and students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Printer size={16} />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Modal Body (Split: Settings & Live Preview) ── */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* ── Left Settings Panel ── */}
          <div className="w-full lg:w-[460px] border-r border-zinc-100 flex flex-col h-full bg-zinc-50/50 shrink-0">
            
            {/* Setting Tabs */}
            <div className="flex border-b border-zinc-100 bg-white px-4 pt-2 gap-1 shrink-0">
              {[
                { key: 'TYPE', label: 'Type & Theme', icon: FileCheck },
                { key: 'STUDENT', label: 'Student Info', icon: User },
                { key: 'INSTITUTION', label: 'Institution & Sign', icon: Building },
                { key: 'ADVANCED', label: 'Details', icon: Sliders },
              ].map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all relative ${
                      isActive
                        ? 'text-purple-700 bg-purple-50/70 border-b-2 border-purple-600'
                        : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* TAB 1: TYPE & THEME */}
              {activeTab === 'TYPE' && (
                <div className="space-y-5">
                  {/* Select Student Quick Switcher */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                      Target Student
                    </label>
                    <select
                      value={data.studentId}
                      onChange={e => handleStudentSelect(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl py-2.5 px-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                      <option value="">-- Choose Student --</option>
                      {allStudents.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.fullNameEn} ({s.studentId} - {s.className || s.batchName || 'Alumni'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Certificate Type Cards */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                      Certificate Category
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {CERTIFICATE_TYPES.map(item => {
                        const isSelected = data.certificateType === item.type
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => setData(prev => ({ ...prev, certificateType: item.type }))}
                            className={`p-3 rounded-xl text-left border transition-all ${
                              isSelected
                                ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20'
                                : 'bg-white border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${isSelected ? 'text-purple-900' : 'text-zinc-800'}`}>
                                {item.label}
                              </span>
                              {isSelected && <Check size={14} className="text-purple-600" />}
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-0.5">{item.labelBn}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Theme Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                      Border & Seal Theme
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {CERTIFICATE_THEMES.map(t => {
                        const isSelected = data.theme === t.theme
                        return (
                          <button
                            key={t.theme}
                            type="button"
                            onClick={() => setData(prev => ({ ...prev, theme: t.theme }))}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                              isSelected
                                ? 'bg-white border-purple-500 shadow-sm ring-2 ring-purple-500/20'
                                : 'bg-white border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <span
                              className="w-5 h-5 rounded-full border border-white shadow-inner flex items-center justify-center shrink-0"
                              style={{ backgroundColor: t.borderColor }}
                            >
                              {isSelected && <Check size={10} className="text-white" />}
                            </span>
                            <div className="text-left">
                              <p className="text-xs font-semibold text-zinc-800 leading-tight">{t.name}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Dual Language Option */}
                  <div className="p-3 bg-white border border-zinc-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-800">Show Bengali Student Name</p>
                      <p className="text-[11px] text-zinc-500">Includes Bengali name under English name</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={showBengali}
                      onChange={e => {
                        setShowBengali(e.target.checked)
                        setData(prev => ({ ...prev, showBengali: e.target.checked }))
                      }}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: STUDENT INFO */}
              {activeTab === 'STUDENT' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Student Full Name (English)</label>
                    <input
                      type="text"
                      value={data.studentNameEn}
                      onChange={e => setData(prev => ({ ...prev, studentNameEn: e.target.value }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Student Full Name (Bengali)</label>
                    <input
                      type="text"
                      value={data.studentNameBn || ''}
                      onChange={e => setData(prev => ({ ...prev, studentNameBn: e.target.value }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                      placeholder="বাংলায় পুরো নাম"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Father's Name</label>
                      <input
                        type="text"
                        value={data.fatherName}
                        onChange={e => setData(prev => ({ ...prev, fatherName: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Mother's Name</label>
                      <input
                        type="text"
                        value={data.motherName}
                        onChange={e => setData(prev => ({ ...prev, motherName: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Student ID Code</label>
                      <input
                        type="text"
                        value={data.studentIdCode}
                        onChange={e => setData(prev => ({ ...prev, studentIdCode: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Roll Number</label>
                      <input
                        type="text"
                        value={data.rollNumber}
                        onChange={e => setData(prev => ({ ...prev, rollNumber: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Class / Batch Passed</label>
                      <input
                        type="text"
                        value={data.classOrBatch}
                        onChange={e => setData(prev => ({ ...prev, classOrBatch: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Group (Optional)</label>
                      <input
                        type="text"
                        value={data.group || ''}
                        onChange={e => setData(prev => ({ ...prev, group: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                        placeholder="e.g. Science"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Academic Session</label>
                      <input
                        type="text"
                        value={data.session}
                        onChange={e => setData(prev => ({ ...prev, session: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">GPA / Score</label>
                      <input
                        type="text"
                        value={data.gpa}
                        onChange={e => setData(prev => ({ ...prev, gpa: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                        placeholder="e.g. GPA 5.00"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INSTITUTION & SIGNATORIES */}
              {activeTab === 'INSTITUTION' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Institution Name</label>
                    <input
                      type="text"
                      value={data.institutionName}
                      onChange={e => setData(prev => ({ ...prev, institutionName: e.target.value }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Tagline / Motto</label>
                    <input
                      type="text"
                      value={data.institutionTagline}
                      onChange={e => setData(prev => ({ ...prev, institutionTagline: e.target.value }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Address & Affiliation</label>
                    <input
                      type="text"
                      value={data.institutionAddress}
                      onChange={e => setData(prev => ({ ...prev, institutionAddress: e.target.value }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <hr className="border-zinc-200 my-2" />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Principal / Head Name</label>
                      <input
                        type="text"
                        value={data.principalName}
                        onChange={e => setData(prev => ({ ...prev, principalName: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Principal Title</label>
                      <input
                        type="text"
                        value={data.principalTitle}
                        onChange={e => setData(prev => ({ ...prev, principalTitle: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">In-charge / Teacher Name</label>
                      <input
                        type="text"
                        value={data.teacherName}
                        onChange={e => setData(prev => ({ ...prev, teacherName: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Teacher Title</label>
                      <input
                        type="text"
                        value={data.teacherTitle}
                        onChange={e => setData(prev => ({ ...prev, teacherTitle: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ADVANCED / METADATA */}
              {activeTab === 'ADVANCED' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Certificate Serial No.</label>
                      <input
                        type="text"
                        value={data.certificateNo}
                        onChange={e => setData(prev => ({ ...prev, certificateNo: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Date of Issue</label>
                      <input
                        type="text"
                        value={data.issueDate}
                        onChange={e => setData(prev => ({ ...prev, issueDate: e.target.value }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Conduct & Moral Character</label>
                    <input
                      type="text"
                      value={data.conduct}
                      onChange={e => setData(prev => ({ ...prev, conduct: e.target.value }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Exemplary & Diligent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Special Remark / Note (Optional)</label>
                    <textarea
                      rows={3}
                      value={data.customRemarks || ''}
                      onChange={e => setData(prev => ({ ...prev, customRemarks: e.target.value }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-none focus:border-purple-500"
                      placeholder="Add any custom congratulatory remarks or honours note..."
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── Right Live Preview Canvas ── */}
          <div className="flex-1 bg-zinc-900/90 p-4 md:p-8 flex flex-col items-center justify-center overflow-y-auto">
            <div className="w-full max-w-4xl flex items-center justify-between mb-3 text-zinc-300">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Eye size={14} className="text-purple-400" />
                Live Preview (A4 Landscape)
              </div>
              <span className="text-[11px] text-zinc-400">
                Vector-sharp Guilloche Security Borders • High-DPI Output
              </span>
            </div>

            {/* Live Interactive Certificate Element */}
            <div className="w-full max-w-4xl shadow-2xl transition-all duration-300 transform scale-[0.98] hover:scale-100">
              <CertificatePreview data={{ ...data, showBengali }} />
            </div>

            <p className="text-[11px] text-zinc-400 text-center mt-4">
              Click <strong>"Print / Save as PDF"</strong> to open the print layout. Set destination to "Save as PDF" for vector document export.
            </p>
          </div>

        </div>

      </div>
    </div>,
    document.body
  )
}
