import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, BookOpen, Hash, Sparkles, Check, BookmarkCheck, Award } from 'lucide-react'
import type { Subject, SubjectFormData, SubjectPaper, ClassGroupType } from '../types'
import { classStore } from '@/data/stores'

interface Props {
  isOpen: boolean
  editing: Subject | null
  defaultClassId?: string
  onClose: () => void
  onSave: (data: SubjectFormData) => void
}

const GROUPS: { id: ClassGroupType; label: string; icon: string }[] = [
  { id: 'SCIENCE', label: 'Science (বিজ্ঞান)', icon: '🔬' },
  { id: 'COMMERCE', label: 'Commerce (ব্যবসায় শিক্ষা)', icon: '💼' },
  { id: 'ARTS', label: 'Humanities (মানবিক)', icon: '📖' },
]

const PAPERS: { id: SubjectPaper; label: string; sub: string }[] = [
  { id: 'NONE', label: 'Single Paper', sub: 'একক পত্র' },
  { id: 'FIRST', label: '1st Paper', sub: '১ম পত্র' },
  { id: 'SECOND', label: '2nd Paper', sub: '২য় পত্র' },
]

const NCTB_PRESETS: {
  label: string
  name: string
  nameBn: string
  code: string
  paper: SubjectPaper
  totalMarks: number
  passMarks: number
  groupId?: ClassGroupType
  isOptional?: boolean
}[] = [
  { label: '🇧🇩 Bangla 1st Paper (বাংলা ১ম পত্র)', name: 'Bangla 1st Paper', nameBn: 'বাংলা ১ম পত্র (সাহিত্য)', code: '101', paper: 'FIRST', totalMarks: 100, passMarks: 33 },
  { label: '🇧🇩 Bangla 2nd Paper (বাংলা ২য় পত্র)', name: 'Bangla 2nd Paper', nameBn: 'বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)', code: '102', paper: 'SECOND', totalMarks: 100, passMarks: 33 },
  { label: '🇬🇧 English 1st Paper (ইংরেজি ১ম পত্র)', name: 'English 1st Paper', nameBn: 'ইংরেজি ১ম পত্র', code: '107', paper: 'FIRST', totalMarks: 100, passMarks: 33 },
  { label: '🇬🇧 English 2nd Paper (ইংরেজি ২য় পত্র)', name: 'English 2nd Paper', nameBn: 'ইংরেজি ২য় পত্র (Grammar & Comp)', code: '108', paper: 'SECOND', totalMarks: 100, passMarks: 33 },
  { label: '📐 General Mathematics (সাধারণ গণিত)', name: 'General Mathematics', nameBn: 'সাধারণ গণিত', code: '109', paper: 'NONE', totalMarks: 100, passMarks: 33 },
  { label: '🔬 Science (সাধারণ বিজ্ঞান)', name: 'Science', nameBn: 'সাধারণ বিজ্ঞান', code: '127', paper: 'NONE', totalMarks: 100, passMarks: 33 },
  { label: '🌏 BGS (বাংলাদেশ ও বিশ্বপরিচয়)', name: 'BGS', nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়', code: '150', paper: 'NONE', totalMarks: 100, passMarks: 33 },
  { label: '🕌 Islam & Moral Edu (ইসলাম ও নৈতিক শিক্ষা)', name: 'Islam & Moral Edu', nameBn: 'ইসলাম ও নৈতিক শিক্ষা', code: '111', paper: 'NONE', totalMarks: 100, passMarks: 33 },
  { label: '💻 ICT (তথ্য ও যোগাযোগ প্রযুক্তি)', name: 'ICT', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি', code: '154', paper: 'NONE', totalMarks: 50, passMarks: 17 },
  { label: '⚡ Physics (পদার্থবিজ্ঞান)', name: 'Physics', nameBn: 'পদার্থবিজ্ঞান', code: '136', paper: 'NONE', totalMarks: 100, passMarks: 33, groupId: 'SCIENCE' },
  { label: '🧪 Chemistry (রসায়ন)', name: 'Chemistry', nameBn: 'রসায়ন', code: '137', paper: 'NONE', totalMarks: 100, passMarks: 33, groupId: 'SCIENCE' },
  { label: '🧬 Biology (জীববিজ্ঞান)', name: 'Biology', nameBn: 'জীববিজ্ঞান', code: '138', paper: 'NONE', totalMarks: 100, passMarks: 33, groupId: 'SCIENCE' },
  { label: '📊 Higher Math (উচ্চতর গণিত - ঐচ্ছিক)', name: 'Higher Math', nameBn: 'উচ্চতর গণিত', code: '126', paper: 'NONE', totalMarks: 100, passMarks: 33, groupId: 'SCIENCE', isOptional: true },
  { label: '📑 Accounting (হিসাববিজ্ঞান)', name: 'Accounting', nameBn: 'হিসাববিজ্ঞান', code: '146', paper: 'NONE', totalMarks: 100, passMarks: 33, groupId: 'COMMERCE' },
  { label: '💼 Business Ent. (ব্যবসায় উদ্যোগ)', name: 'Business Entrepreneurship', nameBn: 'ব্যবসায় উদ্যোগ', code: '143', paper: 'NONE', totalMarks: 100, passMarks: 33, groupId: 'COMMERCE' },
  { label: '🏦 Finance & Banking (ফিন্যান্স ও ব্যাংকিং)', name: 'Finance & Banking', nameBn: 'ফিন্যান্স ও ব্যাংকিং', code: '152', paper: 'NONE', totalMarks: 100, passMarks: 33, groupId: 'COMMERCE' },
  { label: '🏛️ History (বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা)', name: 'History of Bangladesh', nameBn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', code: '153', paper: 'NONE', totalMarks: 100, passMarks: 33, groupId: 'ARTS' },
  { label: '🌍 Geography (ভূগোল ও পরিবেশ)', name: 'Geography & Environment', nameBn: 'ভূগোল ও পরিবেশ', code: '110', paper: 'NONE', totalMarks: 100, passMarks: 33, groupId: 'ARTS' },
  { label: '⚖️ Civics (পৌরনীতি ও নাগরিকতা)', name: 'Civics & Citizenship', nameBn: 'পৌরনীতি ও নাগরিকতা', code: '140', paper: 'NONE', totalMarks: 100, passMarks: 33, groupId: 'ARTS' },
  { label: '📈 Economics (অর্থনীতি)', name: 'Economics', nameBn: 'অর্থনীতি', code: '141', paper: 'NONE', totalMarks: 100, passMarks: 33, groupId: 'ARTS', isOptional: true },
  { label: '🌱 Agriculture Studies (কৃষিশিক্ষা)', name: 'Agriculture Studies', nameBn: 'কৃষিশিক্ষা', code: '134', paper: 'NONE', totalMarks: 100, passMarks: 33, isOptional: true },
]

function normalizeGroup(grp?: string): ClassGroupType | undefined {
  if (!grp) return undefined
  const lower = grp.toLowerCase()
  if (lower.includes('sci')) return 'SCIENCE'
  if (lower.includes('com')) return 'COMMERCE'
  if (lower.includes('art')) return 'ARTS'
  return undefined
}

export function SubjectModal({ isOpen, editing, defaultClassId, onClose, onSave }: Props) {
  const classesList = useMemo(() => {
    return classStore.getAll().filter((c) => c.isActive !== false)
  }, [])

  const initialClassId = defaultClassId || 'cls-6'
  const nameInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<SubjectFormData>({
    classId: initialClassId,
    groupId: undefined,
    name: '',
    nameBn: '',
    code: '',
    paper: 'NONE',
    totalMarks: 100,
    passMarks: 33,
    isOptional: false,
  })

  // Sync state when editing or opening
  useEffect(() => {
    if (!isOpen) return

    if (editing) {
      setForm({
        classId: editing.classId || initialClassId,
        groupId: normalizeGroup(editing.groupId || (editing.groupName as string)),
        name: editing.name || '',
        nameBn: editing.nameBn || '',
        code: editing.code || '',
        paper: editing.paper || 'NONE',
        totalMarks: editing.totalMarks ?? 100,
        passMarks: editing.passMarks ?? 33,
        isOptional: Boolean(editing.isOptional),
      })
    } else {
      setForm({
        classId: defaultClassId || 'cls-6',
        groupId: undefined,
        name: '',
        nameBn: '',
        code: '',
        paper: 'NONE',
        totalMarks: 100,
        passMarks: 33,
        isOptional: false,
      })
    }

    // Auto focus on name input
    const timer = setTimeout(() => {
      nameInputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [editing, isOpen, defaultClassId])

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const selectedClass = classesList.find((c) => c.id === form.classId)
  const showGroups =
    selectedClass?.hasGroups ??
    (form.classId === 'cls-9' ||
      form.classId === 'cls-10' ||
      form.classId === 'cls-11' ||
      form.classId === 'cls-12')

  const set = <K extends keyof SubjectFormData>(key: K, val: SubjectFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  const handleApplyPreset = (presetIndex: string) => {
    if (!presetIndex) return
    const p = NCTB_PRESETS[Number(presetIndex)]
    if (!p) return

    setForm((prev) => ({
      ...prev,
      name: p.name,
      nameBn: p.nameBn,
      code: p.code,
      paper: p.paper,
      totalMarks: p.totalMarks,
      passMarks: p.passMarks,
      groupId: showGroups && p.groupId ? p.groupId : undefined,
      isOptional: p.isOptional ?? false,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) return
    onSave(form)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto overflow-hidden border border-zinc-200 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* ── Modal Header ────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                editing
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-violet-50 text-violet-700 border border-violet-200'
              }`}
            >
              {editing ? <BookmarkCheck size={16} /> : <BookOpen size={16} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-zinc-900 text-sm leading-tight">
                  {editing ? 'Edit Subject' : 'Add New Subject'}
                </h2>
                {editing && (
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                    Code: {editing.code}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500">
                {editing
                  ? `Editing: ${form.name || 'Subject'}`
                  : 'NCTB Curriculum & Board Codes'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Modal Body / Form ───────────────────────────────── */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-zinc-800">
          {/* Quick Preset Selector (Only for new subjects) */}
          {!editing && (
            <div className="p-3 rounded-xl bg-violet-50/60 border border-violet-100 flex items-center gap-2.5">
              <Sparkles size={16} className="text-violet-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <select
                  onChange={(e) => handleApplyPreset(e.target.value)}
                  defaultValue=""
                  className="w-full text-xs font-medium bg-transparent text-violet-900 border-none outline-none cursor-pointer focus:ring-0"
                >
                  <option value="" disabled>
                    ⚡ Auto-fill from Bangladesh NCTB Presets...
                  </option>
                  {NCTB_PRESETS.map((p, idx) => (
                    <option key={p.code + p.name} value={idx}>
                      {p.label} (Code: {p.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Row 1: Class & Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Class (ক্লাস) *
              </label>
              <select
                value={form.classId}
                onChange={(e) => {
                  const newClassId = e.target.value
                  const c = classesList.find((x) => x.id === newClassId)
                  set('classId', newClassId)
                  if (!c?.hasGroups) {
                    set('groupId', undefined)
                  }
                }}
                className="w-full px-3 py-2 text-xs font-semibold border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              >
                {classesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Academic Group (বিভাগ)
              </label>
              <select
                value={form.groupId ?? ''}
                onChange={(e) => set('groupId', (e.target.value || undefined) as ClassGroupType | undefined)}
                disabled={!showGroups}
                className="w-full px-3 py-2 text-xs font-semibold border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">📌 Compulsory / Common (আবশ্যিক)</option>
                {GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.icon} {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Subject Name EN & BN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Subject Name (English) *
              </label>
              <input
                ref={nameInputRef}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Physics 1st Paper"
                required
                className="w-full px-3 py-2 text-xs font-medium border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Subject Name (বাংলায়)
              </label>
              <input
                value={form.nameBn}
                onChange={(e) => set('nameBn', e.target.value)}
                placeholder="যেমন: পদার্থবিজ্ঞান ১ম পত্র"
                className="w-full px-3 py-2 text-xs font-medium border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
          </div>

          {/* Row 3: Board Code, Total Marks, Pass Marks in 1 compact row */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Code (কোড) *
              </label>
              <div className="relative">
                <Hash size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={form.code}
                  onChange={(e) => set('code', e.target.value.toUpperCase())}
                  placeholder="101"
                  required
                  maxLength={8}
                  className="w-full pl-7 pr-2.5 py-2 text-xs font-bold font-mono border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Total Marks
              </label>
              <input
                type="number"
                min={0}
                max={300}
                value={form.totalMarks || ''}
                onChange={(e) => set('totalMarks', Number(e.target.value) || 0)}
                placeholder="100"
                className="w-full px-3 py-2 text-xs font-bold border border-zinc-200 rounded-xl bg-zinc-50 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Pass Marks
              </label>
              <input
                type="number"
                min={0}
                max={form.totalMarks || 100}
                value={form.passMarks || ''}
                onChange={(e) => set('passMarks', Number(e.target.value) || 0)}
                placeholder="33"
                className="w-full px-3 py-2 text-xs font-bold border border-zinc-200 rounded-xl bg-zinc-50 text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
          </div>

          {/* Row 4: Paper Type Selection */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
              Paper Type (পত্র)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAPERS.map((p) => {
                const isSelected = form.paper === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => set('paper', p.id)}
                    className={`py-2 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-500/20 font-bold'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-violet-300 hover:bg-zinc-100 font-medium'
                    }`}
                  >
                    <span className="text-xs">{p.label}</span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        isSelected ? 'text-violet-100 font-normal' : 'text-zinc-400'
                      }`}
                    >
                      {p.sub}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Row 5: Optional 4th Subject Toggle */}
          <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100/70 cursor-pointer transition-colors select-none">
            <input
              type="checkbox"
              checked={form.isOptional}
              onChange={(e) => set('isOptional', e.target.checked)}
              className="w-4 h-4 rounded text-violet-600 accent-violet-600 focus:ring-violet-500"
            />
            <div>
              <p className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <Award size={13} className="text-amber-600" />
                Optional / 4th Subject (ঐচ্ছিক বা ৪র্থ বিষয়)
              </p>
              <p className="text-[11px] text-zinc-500">
                Mark this subject as elective (e.g. Higher Math, Agriculture, Economics)
              </p>
            </div>
          </label>

          {/* ── Modal Footer Actions ────────────────────────────── */}
          <div className="flex gap-2.5 pt-2 shrink-0 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-xs font-bold text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-all shadow-md shadow-violet-500/20 flex items-center justify-center gap-1.5"
            >
              <Check size={15} />
              {editing ? 'Update Subject' : 'Save Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
