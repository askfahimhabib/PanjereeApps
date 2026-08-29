import React from 'react'

export function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-zinc-600">{label}</span>
      <span className="text-sm text-zinc-800">{value}</span>
    </div>
  )
}

export function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="border border-zinc-100 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-zinc-100">
        <Icon size={14} className="text-zinc-600" />
        <h4 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  )
}
