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
    color: 'text-zinc-700',
    bg: 'bg-zinc-50',
    border: 'border-zinc-200',
    dot: 'bg-zinc-400',
  },
  IMPORTANT: {
    label: 'Important',
    color: 'text-amber-800',
    bg: 'bg-amber-50/70',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  URGENT: {
    label: 'Urgent',
    color: 'text-red-800',
    bg: 'bg-red-50/70',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
}
