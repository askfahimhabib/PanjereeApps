import { useState, useMemo } from 'react'
import { subjectStore } from '@/data/stores'
import type { Subject, SubjectFormData, SubjectPaper, ClassGroupType } from './types'

function generateId() {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export interface SubjectFilters {
  classId: string
  groupId: string
  search: string
  paper: SubjectPaper | 'ALL'
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>(() => subjectStore.getAll())
  const [filters, setFilters] = useState<SubjectFilters>({
    classId: 'ALL',
    groupId: 'ALL',
    search: '',
    paper: 'ALL',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

  const filtered = useMemo(() => {
    return subjects.filter(s => {
      if (filters.classId !== 'ALL' && s.classId !== filters.classId) return false
      if (filters.groupId !== 'ALL' && s.groupId !== filters.groupId) return false
      if (filters.paper !== 'ALL' && s.paper !== filters.paper) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!s.name.toLowerCase().includes(q) && !s.nameBn.includes(q) && !s.code.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [subjects, filters])

  // Group by class for display
  const groupedByClass = useMemo(() => {
    const map = new Map<string, { className: string; subjects: Subject[] }>()
    for (const s of filtered) {
      if (!map.has(s.classId)) map.set(s.classId, { className: s.className, subjects: [] })
      map.get(s.classId)!.subjects.push(s)
    }
    return Array.from(map.entries()).map(([classId, data]) => ({ classId, ...data }))
  }, [filtered])

  const openAddModal = () => {
    setEditingSubject(null)
    setIsModalOpen(true)
  }

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSubject(null)
  }

  const saveSubject = (data: SubjectFormData) => {
    if (editingSubject) {
      const updated = subjectStore.update(editingSubject.id, { ...data })
      setSubjects(prev => prev.map(s => s.id === editingSubject.id ? updated : s))
    } else {
      const newSub: Subject = {
        id: generateId(),
        ...data,
        className: `Class ${data.classId.replace('cls-', '')}`,
        groupName: data.groupId as ClassGroupType | undefined,
        createdAt: new Date().toISOString(),
      }
      subjectStore.insert(newSub)
      setSubjects(prev => [...prev, newSub])
    }
    closeModal()
  }

  const deleteSubject = (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return
    subjectStore.remove(id)
    setSubjects(prev => prev.filter(s => s.id !== id))
  }

  const updateFilter = (key: keyof SubjectFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // reset groupId when class changes
      ...(key === 'classId' ? { groupId: 'ALL' } : {}),
    }))
  }

  const stats = useMemo(() => ({
    total: subjects.length,
    filtered: filtered.length,
    withPapers: subjects.filter(s => s.paper !== 'NONE').length,
    optional: subjects.filter(s => s.isOptional).length,
  }), [subjects, filtered])

  return {
    filtered, groupedByClass, filters, stats,
    isModalOpen, editingSubject,
    openAddModal, openEditModal, closeModal,
    saveSubject, deleteSubject, updateFilter,
  }
}
