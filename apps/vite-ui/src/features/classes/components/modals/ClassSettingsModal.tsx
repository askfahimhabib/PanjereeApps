import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Settings2, Trash2, Save, AlertTriangle, ShieldAlert } from 'lucide-react'
import type { ClassItem, ShiftType } from '../../types'

interface ClassSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  classData: ClassItem | null
  onSave: (data: { name: string; shift: ShiftType }) => void
  onDelete: (classId: string) => void
}

const SHIFTS: { value: ShiftType; label: string }[] = [
  { value: 'MORNING', label: '🌅 Morning' },
  { value: 'DAY',     label: '☀️ Day'     },
  { value: 'EVENING', label: '🌙 Evening' },
]

const inputCls =
  'w-full px-3 py-2.5 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl text-sm text-zinc-800 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors'

export function ClassSettingsModal({
  isOpen, onClose, classData, onSave, onDelete,
}: ClassSettingsModalProps) {
  const [name, setName] = useState('')
  const [shift, setShift] = useState<ShiftType>('DAY')
  const [deleteMode, setDeleteMode] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (classData && isOpen) {
      setName(classData.name)
      setShift(classData.shift)
      setDeleteMode(false)
      setDeleteConfirm('')
      setSaved(false)
    }
  }, [classData, isOpen])

  if (!isOpen || !classData) return null

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), shift })
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 700)
  }

  const handleDelete = () => {
    if (deleteConfirm !== classData.name) return
    onDelete(classData.id)
    onClose()
  }

  const handleClose = () => {
    setDeleteMode(false)
    setDeleteConfirm('')
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-md mx-4 bg-white border border-zinc-100 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-xl border border-zinc-100">
              <Settings2 size={16} className="text-zinc-800" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Class Settings</h2>
              <p className="text-xs text-zinc-600 mt-0.5">{classData.name}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-zinc-50 text-zinc-600 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!deleteMode ? (
            <>
              {/* Class Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-800 mb-1.5">Class Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Shift */}
              <div>
                <label className="block text-sm font-medium text-zinc-800 mb-2">Shift</label>
                <div className="grid grid-cols-3 gap-2">
                  {SHIFTS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setShift(s.value)}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        shift === s.value
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/30'
                          : 'bg-zinc-50 border-zinc-100 text-zinc-800 hover:border-indigo-500/40'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-3">
                  <p className="text-zinc-600 mb-0.5">Academic Year</p>
                  <p className="text-zinc-800 font-medium">{classData.academicYear}</p>
                </div>
                <div className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-3">
                  <p className="text-zinc-600 mb-0.5">Total Students</p>
                  <p className="text-zinc-800 font-medium">{classData.totalStudents}</p>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-red-500/20 rounded-xl p-4 bg-red-500/5">
                <p className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-2">
                  <ShieldAlert size={14} /> Danger Zone
                </p>
                <p className="text-xs text-zinc-600 mb-3">
                  Deleting this class will remove all sections, roll data, and student assignments. This cannot be undone.
                </p>
                <button
                  onClick={() => setDeleteMode(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium transition-colors"
                >
                  <Trash2 size={14} /> Delete This Class
                </button>
              </div>
            </>
          ) : (
            /* Delete Confirmation */
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
                <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-red-400 font-semibold mb-1">You are about to delete "{classData.name}"</p>
                  <ul className="text-red-400/70 text-xs space-y-0.5 list-disc list-inside">
                    <li>{classData.totalSections} sections will be deleted</li>
                    <li>{classData.totalStudents} student assignments removed</li>
                    <li>All roll numbers cleared</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                  Type <span className="text-red-400 font-mono">{classData.name}</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder={classData.name}
                  className={`${inputCls} border-red-500/30 focus:border-red-500`}
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-zinc-100">
          {deleteMode ? (
            <>
              <button
                onClick={() => { setDeleteMode(false); setDeleteConfirm('') }}
                className="px-4 py-2 rounded-xl border border-zinc-100 text-zinc-800 hover:bg-zinc-50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== classData.name}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                <Trash2 size={15} /> Delete Permanently
              </button>
            </>
          ) : (
            <>
              <button onClick={handleClose} className="px-4 py-2 rounded-xl border border-zinc-100 text-zinc-800 hover:bg-zinc-50 text-sm font-medium transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all ${
                  saved ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                <Save size={15} />
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  , document.body
  )
}
