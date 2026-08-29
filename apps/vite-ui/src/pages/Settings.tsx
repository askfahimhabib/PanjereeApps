import { School, Calendar, Palette, AlertTriangle, ChevronRight } from 'lucide-react'
import { SchoolInfoForm } from '../features/settings/components/SchoolInfoForm'
import { SessionConfig } from '../features/settings/components/SessionConfig'
import { AppearanceSettings } from '../features/settings/components/AppearanceSettings'
import { useSettingsStore } from '../store/settings'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useState } from 'react'

function SettingsSection({
  id,
  icon: Icon,
  title,
  description,
  children,
}: {
  id: string
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="flex items-start gap-4 mb-5">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
          <Icon size={18} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-900">{title}</h2>
          <p className="text-sm text-zinc-600 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="bg-white border border-zinc-100 rounded-2xl p-5">
        {children}
      </div>
    </section>
  )
}

export function Settings() {
  const { resetToDefaults } = useSettingsStore()

  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description: string
    confirmLabel: string
    variant: 'danger' | 'warning'
    action: () => void
  }>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    variant: 'danger',
    action: () => {},
  })

  const openConfirm = (opts: Omit<typeof confirmState, 'open'>) =>
    setConfirmState({ open: true, ...opts })

  const closeConfirm = () =>
    setConfirmState(s => ({ ...s, open: false }))

  const sections = [
    { id: 'school-info', icon: School, label: 'School Info' },
    { id: 'session',     icon: Calendar, label: 'Academic Session' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'danger',     icon: AlertTriangle, label: 'Danger Zone' },
  ]

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
          <p className="text-sm text-zinc-600 mt-1">Manage school configuration, session, and appearance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[200px_1fr] gap-8">
        {/* Sidebar quick nav */}
        <nav className="hidden xl:block">
          <div className="sticky top-4 space-y-1">
            {sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-800 hover:bg-zinc-50 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <s.icon size={14} />
                  {s.label}
                </div>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="space-y-8">
          {/* School Info */}
          <SettingsSection
            id="school-info"
            icon={School}
            title="School Information"
            description="Name, address, and contact details used across the system and on printed documents."
          >
            <SchoolInfoForm />
          </SettingsSection>

          {/* Session */}
          <SettingsSection
            id="session"
            icon={Calendar}
            title="Academic Session"
            description="Configure the current academic year and when it starts."
          >
            <SessionConfig />
          </SettingsSection>

          {/* Appearance */}
          <SettingsSection
            id="appearance"
            icon={Palette}
            title="Appearance"
            description="Customize the color theme of the application."
          >
            <AppearanceSettings />
          </SettingsSection>

          {/* Danger Zone */}
          <section id="danger" className="scroll-mt-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 shrink-0">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900">Danger Zone</h2>
                <p className="text-sm text-zinc-600 mt-0.5">Irreversible actions — proceed with caution.</p>
              </div>
            </div>
            <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-800">Reset Settings to Defaults</p>
                  <p className="text-xs text-zinc-600 mt-0.5">Restore all settings to their original values. Does not affect student/teacher/payment data.</p>
                </div>
                <button
                  onClick={() =>
                    openConfirm({
                      title: 'Reset Settings to Defaults?',
                      description: 'All settings will be restored to their original values. Student, teacher, and payment data will not be affected.',
                      confirmLabel: 'Reset Settings',
                      variant: 'warning',
                      action: resetToDefaults,
                    })
                  }
                  className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-amber-600 border border-amber-200 hover:bg-amber-50 transition-all"
                >
                  Reset Settings
                </button>
              </div>
              <div className="flex items-start justify-between gap-4 pt-4 border-t border-red-500/15">
                <div>
                  <p className="text-sm font-semibold text-zinc-800">Clear All Mock Data</p>
                  <p className="text-xs text-zinc-600 mt-0.5">Wipes all localStorage data (students, teachers, exams, payments). App will reload with empty stores.</p>
                </div>
                <button
                  onClick={() =>
                    openConfirm({
                      title: 'Delete All Data?',
                      description: 'This will permanently wipe ALL data (students, teachers, exams, payments) and reload the page. This cannot be undone.',
                      confirmLabel: 'Delete Everything',
                      variant: 'danger',
                      action: () => {
                        Object.keys(localStorage)
                          .filter(k => k.startsWith('lms_'))
                          .forEach(k => localStorage.removeItem(k))
                        window.location.reload()
                      },
                    })
                  }
                  className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-all"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        onConfirm={() => { confirmState.action(); closeConfirm() }}
        onCancel={closeConfirm}
      />
    </div>
  )
}
