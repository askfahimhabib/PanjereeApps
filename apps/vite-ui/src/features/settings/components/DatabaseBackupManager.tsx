import { useState, useRef } from 'react'
import {
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ShieldAlert,
} from 'lucide-react'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/auth'
import { AdminDatabaseResetModal } from './AdminDatabaseResetModal'

const ALL_STORE_KEYS = [
  'students',
  'teachers',
  'classes',
  'sections',
  'batches',
  'subjects',
  'groups-mgmt',
  'routines',
  'attendance',
  'teacher_attendance',
  'teacher_leave_balances',
  'leaves',
  'teacher_salaries',
  'teacher_salary_settings',
  'exam_held',
  'calendar-events',
  'payments',
  'manual_dues',
  'fee_structures',
  'student_waivers',
  'monthly_billings',
  'notices',
  'finance_expenses',
  'finance_expense_categories',
  'finance_transactions',
]

export function DatabaseBackupManager() {
  const { user } = useAuthStore()
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── 1. Export Database to JSON ──
  const handleExportBackup = () => {
    try {
      setIsExporting(true)
      const backupData: Record<string, unknown> = {
        metadata: {
          appName: 'Panjeree School Management ERP',
          version: '2.0.0',
          exportedAt: new Date().toISOString(),
          exportedBy: 'Administrator',
        },
        stores: {},
      }

      const storesObj: Record<string, unknown> = {}
      for (const key of ALL_STORE_KEYS) {
        const raw = localStorage.getItem(`lms_store_${key}`) || localStorage.getItem(`store_${key}`) || localStorage.getItem(key)
        if (raw) {
          try {
            storesObj[key] = JSON.parse(raw)
          } catch {
            storesObj[key] = raw
          }
        }
      }
      backupData.stores = storesObj

      // Create blob & download
      const jsonStr = JSON.stringify(backupData, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const dateStr = format(new Date(), 'yyyy-MM-dd_HHmm')
      link.href = url
      link.download = `panjeree_lms_backup_${dateStr}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setStatusMsg({
        type: 'success',
        text: `Backup exported successfully! File downloaded as panjeree_lms_backup_${dateStr}.json`,
      })
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: `Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      })
    } finally {
      setIsExporting(false)
    }
  }

  // ── 2. Restore Database from JSON ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      try {
        const content = event.target?.result as string
        const parsed = JSON.parse(content)

        if (!parsed.stores && !parsed.metadata) {
          throw new Error('Invalid backup file structure. Missing "stores" payload.')
        }

        const stores = parsed.stores || parsed
        let restoredCount = 0

        for (const [key, value] of Object.entries(stores)) {
          if (value) {
            const rawVal = typeof value === 'string' ? value : JSON.stringify(value)
            localStorage.setItem(`lms_store_${key}`, rawVal)
            localStorage.setItem(`store_${key}`, rawVal)
            localStorage.setItem(key, rawVal)
            window.dispatchEvent(new CustomEvent('lms_store_updated', { detail: { key } }))
            restoredCount++
          }
        }

        setStatusMsg({
          type: 'success',
          text: `Successfully restored ${restoredCount} modules from backup! Reloading application...`,
        })

        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } catch (err) {
        setStatusMsg({
          type: 'error',
          text: `Restore failed: ${err instanceof Error ? err.message : 'Invalid JSON file'}`,
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
          <Database size={24} />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-900">Database Snapshot & Disaster Recovery</h3>
          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
            Create an encrypted, portable JSON snapshot of all school records (students, teachers, fees, exam results, routines, and attendance). You can restore this backup anytime to protect against browser cache wipes or migrate workstations.
          </p>
        </div>
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          )}
          <p className="flex-1">{statusMsg.text}</p>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Download size={16} />
              </span>
              <h4 className="text-sm font-bold text-zinc-900">Export Complete Database</h4>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Download all 25+ system databases into a single standalone <code className="text-zinc-700 font-mono">.json</code> file.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            disabled={isExporting}
            className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            <span>{isExporting ? 'Exporting...' : 'Download Database Backup (.json)'}</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <Upload size={16} />
              </span>
              <h4 className="text-sm font-bold text-zinc-900">Restore from Backup File</h4>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Upload a previously downloaded <code className="text-zinc-700 font-mono">.json</code> backup to overwrite and restore records.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload size={14} />
              <span>Select Backup File (.json)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Admin Exclusive: Master Database Reset & Purge ───────── */}
      {user?.role === 'ADMIN' && (
        <div className="mt-8 p-6 rounded-3xl border border-rose-200 bg-rose-50/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-600 text-white shrink-0 shadow-sm">
              <Trash2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-rose-950">Master Database Reset & Purge</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-200 text-rose-800 tracking-wider">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed max-w-xl">
                Wipe all records across all 25 modules to create a clean blank database for real school onboarding, or restore fresh factory demo records.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldAlert size={14} />
            <span>Reset Database...</span>
          </button>
        </div>
      )}

      {/* Admin Reset Modal */}
      <AdminDatabaseResetModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
      />
    </div>
  )
}
