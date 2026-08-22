import { useState } from 'react'
import { Save, Palette } from 'lucide-react'
import { useSettingsStore } from '../../../store/settings'

const PRESET_PALETTES = [
  { name: 'Indigo', primary: '#6366f1', accent: '#8b5cf6' },
  { name: 'Emerald', primary: '#10b981', accent: '#059669' },
  { name: 'Sky', primary: '#0ea5e9', accent: '#38bdf8' },
  { name: 'Rose', primary: '#f43f5e', accent: '#fb7185' },
  { name: 'Amber', primary: '#f59e0b', accent: '#fbbf24' },
  { name: 'Cyan', primary: '#06b6d4', accent: '#22d3ee' },
]

export function AppearanceSettings() {
  const settings = useSettingsStore()
  const [primary, setPrimary] = useState(settings.primaryColor)
  const [accent, setAccent] = useState(settings.accentColor)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    settings.updateAppearance({ primaryColor: primary, accentColor: accent })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const changed = primary !== settings.primaryColor || accent !== settings.accentColor

  return (
    <div className="space-y-6">
      {/* Palette presets */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Palette size={12} /> Color Presets
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESET_PALETTES.map(p => {
            const isActive = p.primary === primary && p.accent === accent
            return (
              <button
                key={p.name}
                onClick={() => { setPrimary(p.primary); setAccent(p.accent) }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  isActive
                    ? 'border-white/30 bg-white/5 ring-1 ring-white/20'
                    : 'border-slate-700/50 hover:border-slate-600 bg-slate-800/40'
                }`}
              >
                <div className="flex gap-1">
                  <span className="w-5 h-5 rounded-full shadow-lg" style={{ backgroundColor: p.primary }} />
                  <span className="w-5 h-5 rounded-full shadow-lg" style={{ backgroundColor: p.accent }} />
                </div>
                <span className="text-[10px] text-slate-400">{p.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom color pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Primary Color</label>
          <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5">
            <input
              type="color"
              value={primary}
              onChange={e => setPrimary(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
            />
            <input
              type="text"
              value={primary}
              onChange={e => setPrimary(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-200 font-mono focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accent Color</label>
          <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5">
            <input
              type="color"
              value={accent}
              onChange={e => setAccent(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
            />
            <input
              type="text"
              value={accent}
              onChange={e => setAccent(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-200 font-mono focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 rounded-xl border border-slate-700/50 space-y-3" style={{ borderColor: `${primary}30` }}>
        <p className="text-xs text-slate-500 uppercase tracking-wider">Preview</p>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all" style={{ backgroundColor: primary }}>
            Primary Button
          </button>
          <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all" style={{ backgroundColor: accent }}>
            Accent Button
          </button>
          <span className="px-3 py-1 rounded-full text-xs font-semibold border" style={{ color: primary, borderColor: `${primary}40`, backgroundColor: `${primary}15` }}>
            Badge
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={!changed}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: primary }}
        >
          <Save size={14} />
          Apply Theme
        </button>
        {saved && <span className="text-xs text-emerald-400 font-medium animate-fadeIn">✓ Theme applied</span>}
      </div>
    </div>
  )
}
