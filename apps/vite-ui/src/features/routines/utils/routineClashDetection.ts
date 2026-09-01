import type { CreateRoutineDto, Routine, ClashWarning } from '../types'

/**
 * Checks whether two time intervals [s1, e1] and [s2, e2] in "HH:MM" format overlap.
 */
function isTimeOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  if (!s1 || !e1 || !s2 || !e2) return false
  return s1 < e2 && e1 > s2
}

/**
 * Detects teacher or room scheduling clashes against all existing routines.
 */
export function checkRoutineClash(
  dto: Partial<CreateRoutineDto>,
  allRoutines: Routine[],
  editingId?: string | null
): ClashWarning[] {
  const warnings: ClashWarning[] = []

  if (!dto.start_time || !dto.end_time) return warnings
  if (!dto.day && !dto.specific_date) return warnings

  for (const slot of allRoutines) {
    if (!slot.is_active) continue
    if (editingId && slot.id === editingId) continue

    // Day or date matching
    const sameDay = dto.day && slot.day && dto.day === slot.day
    const sameDate = dto.specific_date && slot.specific_date && dto.specific_date === slot.specific_date
    if (!sameDay && !sameDate) continue

    // Time overlap check
    if (!isTimeOverlap(dto.start_time, dto.end_time, slot.start_time, slot.end_time)) {
      continue
    }

    const targetLabel = slot.classes?.name ?? slot.batches?.name ?? slot.class_id ?? slot.batch_id ?? 'Another group'

    // 1. Check Teacher Clash
    if (dto.teacher_id && slot.teacher_id && dto.teacher_id === slot.teacher_id) {
      const teacherName = slot.teachers?.full_name ?? 'This teacher'
      warnings.push({
        type: 'TEACHER_CLASH',
        message: `${teacherName} is already scheduled in ${targetLabel} (${slot.start_time} - ${slot.end_time})`,
        conflictingSlot: slot,
      })
    }

    // 2. Check Room Clash
    if (dto.room && slot.room && dto.room.trim().toLowerCase() === slot.room.trim().toLowerCase()) {
      warnings.push({
        type: 'ROOM_CLASH',
        message: `Room "${dto.room}" is already occupied by ${targetLabel} (${slot.start_time} - ${slot.end_time})`,
        conflictingSlot: slot,
      })
    }
  }

  return warnings
}
