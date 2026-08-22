import React from 'react'

export function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm text-slate-200">{value}</span>
    </div>
  )
}

export function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/40 border-b border-slate-700/50">
        <Icon size={14} className="text-slate-400" />
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  )
}
