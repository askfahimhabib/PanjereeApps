import { Link } from 'react-router-dom'
import {
  Calendar,
  ArrowRight,
  PartyPopper,
  GraduationCap,
  Sun,
} from 'lucide-react'
import type { RawCalendarEvent } from '@/data/mockData'
import { format, parseISO } from 'date-fns'

interface WidgetCalendarEventsProps {
  upcomingEvents: (RawCalendarEvent & { daysUntil: number })[]
}

export function WidgetCalendarEvents({
  upcomingEvents,
}: WidgetCalendarEventsProps) {
  const typeIcons = {
    HOLIDAY: Sun,
    EVENT: PartyPopper,
    EXAM: GraduationCap,
  }

  const typeBadges = {
    HOLIDAY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    EVENT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    EXAM: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  return (
    <div className="card-surface p-5.5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-50 text-cyan-600">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Academic Events & Holidays</h2>
              <p className="text-[11px] text-zinc-400">Next 30 days calendar milestones</p>
            </div>
          </div>

          <Link
            to="/calendar"
            className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:underline transition-colors"
          >
            <span>Full Calendar</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Events list */}
        {upcomingEvents.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 bg-zinc-50 rounded-xl border border-zinc-100">
            <Calendar size={24} className="mx-auto mb-1 opacity-30" />
            <p className="text-xs font-semibold text-zinc-600">No events scheduled this month</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
            {upcomingEvents.map(event => {
              const Icon = typeIcons[event.type] || Calendar
              const badge = typeBadges[event.type] || typeBadges.EVENT

              let dateFormatted = ''
              try {
                dateFormatted = format(parseISO(event.date), 'dd MMM yyyy')
              } catch {
                dateFormatted = event.date
              }

              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-100 text-zinc-700 shrink-0">
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">{event.title}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {dateFormatted} {event.description ? `• ${event.description}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge}`}
                    >
                      {event.daysUntil === 0
                        ? 'Today'
                        : event.daysUntil === 1
                        ? 'Tomorrow'
                        : `In ${event.daysUntil} days`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">
          {upcomingEvents.length} calendar events ahead
        </span>
        <Link
          to="/calendar"
          className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:underline transition-colors"
        >
          <span>View Planner</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
