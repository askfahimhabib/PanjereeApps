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
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  CLASS_EXAM: {
    label: 'Class Test',
    labelBn: 'Class Test',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  FORMAL_EXAM: {
    label: 'Formal Exam',
    labelBn: 'আনুষ্ঠানিক পরীক্ষা',
    color: 'text-purple-400',
    bg: 'bg-purple-900/40',
    border: 'border-purple-500/30',
  },
  OFF_DAY: {
    label: 'Off Day',
    labelBn: 'বন্ধ',
    color: 'text-red-400',
    bg: 'bg-red-900/40',
    border: 'border-red-500/30',
  },
}
