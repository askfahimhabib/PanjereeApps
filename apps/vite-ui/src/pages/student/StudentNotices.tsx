import { useState, useMemo } from 'react'
import {
  Bell,
  Search,
  Pin,
  FileText,
  X,
  Printer,
  ChevronRight,
} from 'lucide-react'
import { useStudentSession } from '@/features/student-portal/hooks/useStudentSession'
import { noticeStore } from '@/data/stores'
import type { Notice } from '@/features/notices/types'

export function StudentNotices() {
  const { student } = useStudentSession()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'URGENT' | 'HOLIDAY'>('ALL')
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)

  // Fetch notices from store
  const allNotices = useMemo(() => noticeStore.getAll(), [])

  // Filter for this student
  const filteredNotices = useMemo(() => {
    return allNotices
      .filter((n) => {
        if (!n.isPublished) return false

        // Target filtering: must be ALL or STUDENTS; and if targetClassId is specified, must match student's class
        const isTargetedGroup = n.target === 'ALL' || n.target === 'STUDENTS'
        if (!isTargetedGroup) return false

        if (n.targetClassId && student.classId && n.targetClassId !== student.classId) {
          return false
        }

        // Category filter
        if (activeCategory === 'URGENT' && n.priority !== 'URGENT') return false
        if (activeCategory === 'HOLIDAY' && !n.title.toLowerCase().includes('holiday') && !n.title.includes('ছুটি')) return false

        // Search text
        if (search.trim()) {
          const q = search.toLowerCase()
          return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
        }

        return true
      })
      .sort((a, b) => {
        if (a.priority === 'URGENT' && b.priority !== 'URGENT') return -1
        if (a.priority !== 'URGENT' && b.priority === 'URGENT') return 1
        return new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime()
      })
  }, [allNotices, student.classId, activeCategory, search])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Bell className="text-purple-500" size={22} />
            Institutional Notice Board (নোটিশ বোর্ড)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Official circulars, exam schedules, and holiday announcements for {student.fullNameEn}
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notice keyword..."
            className="w-full text-xs pl-9 pr-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-800 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeCategory === 'ALL'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
          }`}
        >
          All Announcements
        </button>

        <button
          onClick={() => setActiveCategory('URGENT')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeCategory === 'URGENT'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
          }`}
        >
          <Pin size={13} />
          Urgent Notices
        </button>

        <button
          onClick={() => setActiveCategory('HOLIDAY')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeCategory === 'HOLIDAY'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
          }`}
        >
          Holidays & Vacations
        </button>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {filteredNotices.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-zinc-400 text-xs">
            No notices found matching your criteria.
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const isUrgent = notice.priority === 'URGENT'

            return (
              <div
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isUrgent
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-500/30'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    isUrgent
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  }`}>
                    {isUrgent ? <Pin size={18} /> : <FileText size={18} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {isUrgent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white uppercase tracking-wider">
                          URGENT
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {notice.target === 'ALL' ? 'For Everyone' : notice.target}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white mt-1.5">
                      {notice.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {notice.body}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 text-xs">
                  <span className="text-zinc-400 font-mono text-[11px]">
                    {notice.publishedAt ? new Date(notice.publishedAt).toLocaleDateString('en-GB') : 'Recent'}
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 mt-1">
                    Read Details <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Notice Detail Reader Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
              <div className="flex items-center gap-2">
                <FileText className="text-purple-600" size={18} />
                <span className="font-bold text-sm text-zinc-900 dark:text-white">Notice Circular</span>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Published: {selectedNotice.publishedAt ? new Date(selectedNotice.publishedAt).toLocaleDateString('en-GB') : 'March 2026'}
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                  {selectedNotice.title}
                </h3>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {selectedNotice.body}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Printer size={15} />
                  Print Notice
                </button>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
