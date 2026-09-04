import React from 'react'

export interface ProfileKpiItem {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  badge?: string
  accentColor?: string
}

export interface ProfileKpiGridProps {
  items: ProfileKpiItem[]
}

export function ProfileKpiGrid({ items }: ProfileKpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon

        return (
          <div
            key={idx}
            className="group relative bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-zinc-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                {item.title}
              </span>
              <div className="w-8 h-8 rounded-xl bg-zinc-100/90 text-zinc-700 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-200 shrink-0">
                <Icon size={15} />
              </div>
            </div>

            {/* Value & Subtitle */}
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight font-mono">
                  {item.value}
                </p>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>

              {item.subtitle && (
                <p className="text-xs font-medium text-zinc-600 mt-1 truncate" title={item.subtitle}>
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
