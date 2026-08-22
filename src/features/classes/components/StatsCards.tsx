import { BookOpen, Users, LayoutGrid, DollarSign, History } from 'lucide-react'

interface StatsCardsProps {
  totalClasses: number
  totalStudents: number
  totalSections: number
  feeCollected: number
  onFeeCardClick?: () => void
}

const cards = [
  {
    key: 'totalClasses' as const,
    label: 'Total Classes',
    icon: BookOpen,
    gradient: 'from-blue-600/20 to-blue-900/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-600/20',
    iconColor: 'text-blue-400',
    valueColor: 'text-blue-300',
  },
  {
    key: 'totalStudents' as const,
    label: 'Total Students',
    icon: Users,
    gradient: 'from-emerald-600/20 to-emerald-900/10',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-600/20',
    iconColor: 'text-emerald-400',
    valueColor: 'text-emerald-300',
  },
  {
    key: 'totalSections' as const,
    label: 'Total Sections',
    icon: LayoutGrid,
    gradient: 'from-purple-600/20 to-purple-900/10',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-600/20',
    iconColor: 'text-purple-400',
    valueColor: 'text-purple-300',
  },
  {
    key: 'feeCollected' as const,
    label: 'Collected This Month',
    icon: DollarSign,
    gradient: 'from-amber-600/20 to-amber-900/10',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-600/20',
    iconColor: 'text-amber-400',
    valueColor: 'text-amber-300',
    format: (v: number) => {
      if (v === 0) return '৳ 0'
      if (v < 1000) return `৳ ${v.toLocaleString('en-BD')}`
      if (v < 100000) return `৳ ${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`
      return `৳ ${(v / 100000).toFixed(1).replace(/\.0$/, '')}L`
    },
    clickable: true,
  },
]

export function StatsCards({ totalClasses, totalStudents, totalSections, feeCollected, onFeeCardClick }: StatsCardsProps) {
  const values = { totalClasses, totalStudents, totalSections, feeCollected }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon
        const raw = values[card.key]
        const display = 'format' in card ? card.format?.(raw) ?? raw : raw
        const isClickable = 'clickable' in card && card.clickable && !!onFeeCardClick

        return (
          <div
            key={card.key}
            onClick={isClickable ? onFeeCardClick : undefined}
            className={`relative overflow-hidden rounded-xl border ${card.border} bg-gradient-to-br ${card.gradient} p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 ${
              isClickable ? 'cursor-pointer hover:ring-1 hover:ring-amber-500/40 hover:shadow-lg hover:shadow-amber-900/20' : ''
            }`}
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-20 bg-white" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  {card.label}
                </p>
                <p className={`text-3xl font-bold ${card.valueColor}`}>{display}</p>
              </div>
              <div className={`${card.iconBg} p-2.5 rounded-lg`}>
                <Icon className={card.iconColor} size={20} />
              </div>
            </div>
            {isClickable && (
              <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-500/70">
                <History size={9} />
                <span>View history</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
