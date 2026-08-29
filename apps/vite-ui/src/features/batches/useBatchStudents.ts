import { useState, useMemo } from 'react'
import { createStore } from '@/lib/localStore'
import type { Student } from '@/features/students/types'
import type { Batch } from './types'

// Shared student store (same key as useStudents)
const studentStore = createStore<Student>('students')

export function useBatchStudents(batch: Batch) {
  const [students, setStudents] = useState<Student[]>(() =>
    studentStore.getWhere(s => s.batchId === batch.id)
  )
  const [search, setSearch] = useState('')
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const refresh = () => setStudents(studentStore.getWhere(s => s.batchId === batch.id))

  // Students currently in this batch, filtered by search
  const filtered = useMemo(() =>
    students.filter(s =>
      !search ||
      s.fullNameEn.toLowerCase().includes(search.toLowerCase()) ||
      s.fullNameBn.includes(search) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      (s.mobile ?? '').includes(search)
    ), [students, search])

  // All students NOT yet in this batch (available for selection)
  const availableStudents = useMemo(() => {
    const inBatch = new Set(students.map(s => s.id))
    return studentStore.getAll().filter(s => !inBatch.has(s.id) && !s.isArchived)
  }, [students])

  // Assign one or more existing students to this batch
  const assignStudents = (ids: string[]) => {
    for (const id of ids) {
      studentStore.update(id, {
        batchId: batch.id,
        batchName: batch.name,
        type: 'EXAM_BATCH',
        targetExam: batch.examName as 'SSC' | 'HSC',
        updatedAt: new Date().toISOString(),
        updatedBy: 'Admin',
      })
    }
    refresh()
    setIsPickerOpen(false)
  }

  // Remove student from batch (keep student in system)
  const removeStudent = (id: string) => {
    if (!confirm('Remove this student from the batch?')) return
    studentStore.update(id, {
      batchId: undefined,
      batchName: undefined,
      type: 'REGULAR',
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin',
    })
    refresh()
  }

  return {
    filtered, search, setSearch,
    isPickerOpen, setIsPickerOpen,
    availableStudents,
    assignStudents,
    removeStudent,
  }
}
