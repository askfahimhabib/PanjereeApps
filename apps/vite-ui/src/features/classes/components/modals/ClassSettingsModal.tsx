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

export function ClassSettingsModal({
  isOpen,
  onClose,
  classData,
  onSave,
  onDelete,
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
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 700)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
              <Settings2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900">Class Settings</h2>
              <p className="text-xs text-zinc-500 font-medium">{classData.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!deleteMode ? (
            <>
              {/* Class Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Class Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>

              {/* Shift */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                  Academic Shift
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SHIFTS.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setShift(s.value)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        shift === s.value
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3">
                  <p className="text-zinc-500 font-medium mb-0.5">Academic Session</p>
                  <p className="text-zinc-900 font-extrabold">{classData.academicYear}</p>
                </div>
                <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3">
                  <p className="text-zinc-500 font-medium mb-0.5">Total Enrolled</p>
                  <p className="text-zinc-900 font-extrabold">{classData.totalStudents} Students</p>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-rose-200 rounded-2xl p-4 bg-rose-50/50">
                <p className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <ShieldAlert size={14} />
                  <span>Danger Zone</span>
                </p>
                <p className="text-xs text-zinc-600 mb-3">
                  Deleting this class will remove all linked sections, roll assignments, and timetable periods.
                </p>
                <button
                  type="button"
                  onClick={() => setDeleteMode(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete This Class</span>
                </button>
              </div>
            </>
          ) : (
            /* Delete Confirmation */
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex gap-3 text-xs">
                <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-rose-900 font-bold mb-1">
                    You are about to delete &quot;{classData.name}&quot;
                  </p>
                  <ul className="text-rose-700 space-y-0.5 list-disc list-inside">
                    <li>{classData.totalSections} sections will be removed</li>
                    <li>{classData.totalStudents} student associations cleared</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Type <span className="text-rose-600 font-mono font-bold">{classData.name}</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder={classData.name}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-rose-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
          {deleteMode ? (
            <>
              <button
                onClick={() => {
                  setDeleteMode(false)
                  setDeleteConfirm('')
                }}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== classData.name}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-rose-500/20"
              >
                <Trash2 size={14} />
                <span>Delete Permanently</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer ${
                  saved ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                }`}
              >
                <Save size={14} />
                <span>{saved ? 'Saved!' : 'Save Changes'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
