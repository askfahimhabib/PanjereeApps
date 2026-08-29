// ============================================================
//  Notices Module — TypeScript Definitions
// ============================================================

export type NoticeTarget = 'ALL' | 'STUDENTS' | 'TEACHERS' | 'PARENTS' | 'CLASS'
export type NoticePriority = 'NORMAL' | 'IMPORTANT' | 'URGENT'

export interface Notice {
  id: string
  title: string
  body: string
  target: NoticeTarget
  targetClassId?: string
  priority: NoticePriority
  publishedAt: string   // ISO
  expiresAt?: string    // ISO
  createdBy: string
  isPublished: boolean
}

export interface CreateNoticeDto {
  title: string
  body: string
  target: NoticeTarget
  targetClassId?: string
  priority: NoticePriority
  expiresAt?: string
}

// ─── Display helpers ──────────────────────────────────────────

export const TARGET_LABELS: Record<NoticeTarget, string> = {
  ALL:      'Everyone',
  STUDENTS: 'Students',
  TEACHERS: 'Teachers',
  PARENTS:  'Parents',
  CLASS:    'Specific Class',
}

export const PRIORITY_CONFIG: Record<NoticePriority, {
  label: string
  color: string
  bg: string
  border: string
  dot: string
}> = {
  NORMAL: {
    label: 'Normal',
    color: 'text-zinc-600',
    bg: 'bg-zinc-100',
    border: 'border-zinc-100',
    dot: 'bg-zinc-500',
  },
  IMPORTANT: {
    label: 'Important',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  URGENT: {
    label: 'Urgent',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
  },
}
