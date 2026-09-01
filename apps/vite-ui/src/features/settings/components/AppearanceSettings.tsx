import { useState } from 'react'
import { Save, Palette, Printer, CheckCircle2, FileText, Receipt } from 'lucide-react'
import { useSettingsStore, type ReceiptPrintFormat } from '../../../store/settings'

const PRESET_PALETTES = [
  { name: 'Indigo Modern', primary: '#4f46e5', accent: '#059669' },
  { name: 'Emerald Institution', primary: '#059669', accent: '#10b981' },
  { name: 'Slate Corporate', primary: '#0f172a', accent: '#3b82f6' },
  { name: 'Rose Crimson', primary: '#e11d48', accent: '#f43f5e' },
  { name: 'Amber Gold', primary: '#d97706', accent: '#f59e0b' },
  { name: 'Cyan Tech', primary: '#0891b2', accent: '#06b6d4' },
]

export function AppearanceSettings() {
  const settings = useSettingsStore()
  const [primary, setPrimary] = useState(settings.primaryColor)
  const [accent, setAccent] = useState(settings.accentColor)
  const [receiptPrintFormat, setReceiptPrintFormat] = useState<ReceiptPrintFormat>(settings.receiptPrintFormat)
  const [showWatermarkOnDocs, setShowWatermarkOnDocs] = useState(settings.showWatermarkOnDocs)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    settings.updateAppearance({
      primaryColor: primary,
      accentColor: accent,
      receiptPrintFormat,
      showWatermarkOnDocs,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Color Palette Presets ── */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <Palette size={14} className="text-indigo-600" /> UI Theme Color Palette
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {PRESET_PALETTES.map((p) => {
            const isActive = p.primary === primary && p.accent === accent
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setPrimary(p.primary)
                  setAccent(p.accent)
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50'
                }`}
              >
                <div className="flex gap-1.5">
                  <span className="w-5 h-5 rounded-full shadow-xs" style={{ backgroundColor: p.primary }} />
                  <span className="w-5 h-5 rounded-full shadow-xs" style={{ backgroundColor: p.accent }} />
                </div>
                <span className="text-[11px] font-bold text-zinc-800">{p.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 2. Custom Color Pickers ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Primary Brand Accent</label>
          <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2">
            <input
              type="color"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
            />
            <input
              type="text"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="flex-1 bg-transparent text-xs text-zinc-900 font-mono font-bold focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700">Secondary Accent</label>
          <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2">
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
            />
            <input
              type="text"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="flex-1 bg-transparent text-xs text-zinc-900 font-mono font-bold focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── 3. Print Format & Watermark ── */}
      <div className="pt-4 border-t border-zinc-100">
        <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Printer size={14} className="text-emerald-600" /> Print Documents & Receipt Layout
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              id: 'A4_INVOICE',
              title: 'Standard A4 Full Page Invoice',
              desc: 'Classic formal layout with double copies (Student & School Office copy)',
              icon: FileText,
            },
            {
              id: 'THERMAL_POS',
              title: '80mm Thermal POS Slip',
              desc: 'Compact receipt slip for fast counter thermal receipt printers',
              icon: Receipt,
            },
          ].map((item) => {
            const Icon = item.icon
            const isSelected = receiptPrintFormat === item.id
            return (
              <div
                key={item.id}
                onClick={() => setReceiptPrintFormat(item.id as ReceiptPrintFormat)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                    : 'bg-zinc-50/50 border-zinc-200 hover:bg-white hover:border-zinc-300'
                }`}
              >
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900">{item.title}</span>
                    <input
                      type="radio"
                      name="receiptPrintFormat"
                      checked={isSelected}
                      onChange={() => setReceiptPrintFormat(item.id as ReceiptPrintFormat)}
                      className="accent-indigo-600"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200">
          <div>
            <p className="text-xs font-bold text-zinc-900">Show Institutional Watermark on Official Documents</p>
            <p className="text-[11px] text-zinc-500">Render a subtle security watermark seal in the background of marksheets and transcripts.</p>
          </div>
          <input
            type="checkbox"
            checked={showWatermarkOnDocs}
            onChange={(e) => setShowWatermarkOnDocs(e.target.checked)}
            className="w-4 h-4 accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
        {saved ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
            <CheckCircle2 size={16} />
            Appearance and print settings saved!
          </span>
        ) : (
          <span className="text-xs text-zinc-400 font-medium">Customizes user interface colors and print layouts</span>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Save size={15} />
          Save Appearance & Print
        </button>
      </div>
    </div>
  )
}
