import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react'

interface AbsentSmsModalProps {
  isOpen: boolean
  onClose: () => void
  className: string
  sectionName: string
  date: string
  absentStudents: { id: string; name: string; roll: string; guardianPhone?: string }[]
}

export function AbsentSmsModal({
  isOpen,
  onClose,
  className: clsName,
  sectionName,
  date,
  absentStudents,
}: AbsentSmsModalProps) {
  const [template, setTemplate] = useState(
    `Dear Guardian, your ward [Student Name] (Roll: [Roll]) was absent from ${clsName} (Sec ${sectionName}) on ${date}. Please contact the school office if unexcused.`
  )
  const [sent, setSent] = useState(false)

  if (!isOpen) return null

  const handleSend = () => {
    setSent(true)
    setTimeout(() => {
      setSent(false)
      onClose()
    }, 1200)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900">Send Absent Alert SMS</h2>
              <p className="text-xs text-zinc-500 font-medium">
                Notify guardians of {absentStudents.length} absent students
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {absentStudents.length === 0 ? (
            <div className="py-8 text-center bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-500 text-xs">
              No students are currently marked absent in this section.
            </div>
          ) : (
            <>
              {/* Recipients Preview */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                  Recipients List ({absentStudents.length})
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  {absentStudents.map(st => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between px-3 py-1.5 bg-white border border-zinc-200/80 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-500">#{st.roll}</span>
                        <span className="font-bold text-zinc-900">{st.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-zinc-500">
                        {st.guardianPhone || '01700-000000'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SMS Template */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  SMS Notification Template
                </label>
                <textarea
                  rows={4}
                  value={template}
                  onChange={e => setTemplate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-colors resize-none font-sans"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Variables <code className="text-rose-600 font-mono">[Student Name]</code>,{' '}
                  <code className="text-rose-600 font-mono">[Roll]</code>, and{' '}
                  <code className="text-rose-600 font-mono">[Date]</code> will be auto-replaced.
                </p>
              </div>

              {/* SMS Gateway Balance Warning */}
              <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Using integrated SMS Gateway. Approximately {absentStudents.length} SMS credits will be deducted.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={absentStudents.length === 0 || sent}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer ${
              sent ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
            }`}
          >
            {sent ? (
              <>
                <CheckCircle size={15} />
                <span>Alerts Sent!</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Broadcast SMS</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
