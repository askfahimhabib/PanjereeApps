import { School, Calendar, Palette, AlertTriangle, ChevronRight } from 'lucide-react'
import { SchoolInfoForm } from '../features/settings/components/SchoolInfoForm'
import { SessionConfig } from '../features/settings/components/SessionConfig'
import { AppearanceSettings } from '../features/settings/components/AppearanceSettings'
import { useSettingsStore } from '../store/settings'

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
          <h2 className="text-base font-bold text-slate-100">{title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
        {children}
      </div>
    </section>
  )
}

export function Settings() {
  const { resetToDefaults } = useSettingsStore()

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
          <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage school configuration, session, and appearance</p>
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
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all group"
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
                <h2 className="text-base font-bold text-slate-100">Danger Zone</h2>
                <p className="text-sm text-slate-500 mt-0.5">Irreversible actions — proceed with caution.</p>
              </div>
            </div>
            <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-200">Reset Settings to Defaults</p>
                  <p className="text-xs text-slate-500 mt-0.5">Restore all settings to their original values. Does not affect student/teacher/payment data.</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
                      resetToDefaults()
                    }
                  }}
                  className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
                >
                  Reset Settings
                </button>
              </div>
              <div className="flex items-start justify-between gap-4 pt-4 border-t border-red-500/15">
                <div>
                  <p className="text-sm font-semibold text-slate-200">Clear All Mock Data</p>
                  <p className="text-xs text-slate-500 mt-0.5">Wipes all localStorage data (students, teachers, exams, payments). App will reload with empty stores.</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('This will DELETE ALL data and reload the page. Are you absolutely sure?')) {
                      Object.keys(localStorage).filter(k => k.startsWith('lms_')).forEach(k => localStorage.removeItem(k))
                      window.location.reload()
                    }
                  }}
                  className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600/80 hover:bg-red-600 text-white transition-all"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
