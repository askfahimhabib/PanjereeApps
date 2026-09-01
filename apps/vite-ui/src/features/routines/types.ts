// ─── Enums ──────────────────────────────────────────────────────────────────

export type RoutineEntryType = 'CLASS' | 'CLASS_EXAM' | 'FORMAL_EXAM' | 'OFF_DAY'
export type RoutineTargetType = 'CLASS' | 'BATCH'
export type DayOfWeek = 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'

// ─── Routine ─────────────────────────────────────────────────────────────────

export interface Routine {
  id: string
  target_type: RoutineTargetType
  class_id: string | null
  section_id: string | null
  batch_id: string | null
  entry_type: RoutineEntryType
  subject_id: string | null
  teacher_id: string | null
  day: DayOfWeek | null
  specific_date: string | null    // DATE string "YYYY-MM-DD"
  start_time: string              // "09:00"
  end_time: string                // "10:30"
  room: string | null
  topic?: string | null           // Syllabus / Chapter / Topic for Class Test
  total_marks?: number | null     // Total marks for Class Test
  source_exam_held_id: string | null
  is_active: boolean
  postpone_note: string | null
  created_at: string
  updated_at: string

  // Joined
  subjects?: { id: string; name: string; name_bn: string | null }
  teachers?: { id: string; full_name: string }
  sections?: { id: string; name: string }
  classes?: { id: string; name: string }
  batches?: { id: string; name: string }
}

// ─── Create / Update DTOs ────────────────────────────────────────────────────

export interface CreateRoutineDto {
  target_type: RoutineTargetType
  class_id?: string
  section_id?: string
  batch_id?: string
  entry_type: RoutineEntryType
  subject_id?: string
  teacher_id?: string
  day?: DayOfWeek
  specific_date?: string
  start_time: string
  end_time: string
  room?: string
  topic?: string
  total_marks?: number
}

// ─── Clash Detection ─────────────────────────────────────────────────────────

export interface ClashWarning {
  type: 'TEACHER_CLASH' | 'ROOM_CLASH'
  message: string
  conflictingSlot: Routine
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const DAY_LABELS: Record<DayOfWeek, string> = {
  SUNDAY: 'Sunday',
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
}

export const WEEKDAYS: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

export const ENTRY_TYPE_CONFIG: Record<RoutineEntryType, { label: string; labelBn: string; color: string; bg: string; border: string }> = {
  CLASS: {
    label: 'Class',
    labelBn: 'Class',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  CLASS_EXAM: {
    label: 'Class Test',
    labelBn: 'Class Test',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  FORMAL_EXAM: {
    label: 'Formal Exam',
    labelBn: 'আনুষ্ঠানিক পরীক্ষা',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  OFF_DAY: {
    label: 'Off Day',
    labelBn: 'বন্ধ',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
}
