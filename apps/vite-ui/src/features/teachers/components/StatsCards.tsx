import { Users, UserCheck, Clock, Briefcase, UserCog, Star } from 'lucide-react'

interface Stats {
  total: number
  regular: number
  guest: number
  active: number
  onLeave: number
  fullTime: number
}

interface Props { stats: Stats }

const cards = [
  { key: 'total',    label: 'Total',          icon: Users,    color: 'from-blue-600/20 to-blue-500/10',       border: 'border-blue-500/20',    icon_color: 'text-blue-400' },
  { key: 'regular',  label: 'Regular',         icon: UserCog,  color: 'from-emerald-600/20 to-emerald-500/10', border: 'border-emerald-500/20', icon_color: 'text-emerald-400' },
  { key: 'guest',    label: 'Guest',           icon: Star,     color: 'from-violet-600/20 to-violet-500/10',   border: 'border-violet-500/20',  icon_color: 'text-violet-400' },
  { key: 'active',   label: 'Active',          icon: UserCheck,color: 'from-cyan-600/20 to-cyan-500/10',       border: 'border-cyan-500/20',    icon_color: 'text-cyan-400' },
  { key: 'onLeave',  label: 'On Leave',        icon: Clock,    color: 'from-amber-600/20 to-amber-500/10',     border: 'border-amber-500/20',   icon_color: 'text-amber-400' },
  { key: 'fullTime', label: 'Full Time',       icon: Briefcase,color: 'from-purple-600/20 to-purple-500/10',   border: 'border-purple-500/20',  icon_color: 'text-purple-400' },
] as const

export function StatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      {cards.map(card => {
        const Icon = card.icon
        const value = stats[card.key as keyof Stats]
        const iconBg = card.color.split(' ')[0].replace('from-', 'bg-')
        const valueColor = card.icon_color.replace('400', '300')
        return (
          <div
            key={card.key}
            className={`relative overflow-hidden rounded-xl border ${card.border} bg-gradient-to-br ${card.color} p-5 backdrop-blur-sm transition-transform hover:-translate-y-0.5`}
          >
            {/* Background glow */}
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-20 bg-white" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-2">
                  {card.label}
                </p>
                <p className={`text-3xl font-bold ${valueColor}`}>
                  {value}
                </p>
              </div>
              <div className={`${iconBg} p-2.5 rounded-lg`}>
                <Icon className={card.icon_color} size={20} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
