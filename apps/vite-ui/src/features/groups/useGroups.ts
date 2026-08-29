import { useState, useMemo } from 'react'
import { groupStore, classStore } from '@/data/stores'
import type { ClassItem } from '@/features/classes/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export type GroupName = 'SCIENCE' | 'ARTS' | 'COMMERCE'

export interface GroupRecord {
  id: string
  classId: string
  className: string
  name: GroupName
  totalStudents: number
  totalSections: number
  totalSubjects: number
  classTeacher?: string
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGroups() {
  const [groups, setGroups] = useState<GroupRecord[]>(() => groupStore.getAll())
  const [filterClass, setFilterClass] = useState('ALL')
  const [filterGroup, setFilterGroup] = useState<GroupName | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  // Live class list from store (dynamic dropdown)
  const activeClasses = classStore
    .getAll()
    .map(c => ({ ...c, isActive: c.isActive ?? true }))
    .filter(c => c.isActive)
    .sort((a, b) => a.numericName - b.numericName)

  const filtered = useMemo(() =>
    groups.filter(g => {
      if (filterClass !== 'ALL' && g.classId !== filterClass) return false
      if (filterGroup !== 'ALL' && g.name !== filterGroup) return false
      if (search && !g.className.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }), [groups, filterClass, filterGroup, search])

  // Group by class
  const byClass = useMemo(() => {
    const map = new Map<string, { className: string; groups: GroupRecord[] }>()
    for (const g of filtered) {
      if (!map.has(g.classId)) map.set(g.classId, { className: g.className, groups: [] })
      map.get(g.classId)!.groups.push(g)
    }
    return Array.from(map.entries()).map(([classId, data]) => ({ classId, ...data }))
  }, [filtered])

  const stats = useMemo(() => ({
    total: groups.length,
    totalStudents: groups.reduce((a, g) => a + g.totalStudents, 0),
    science: groups.filter(g => g.name === 'SCIENCE').length,
    arts: groups.filter(g => g.name === 'ARTS').length,
    commerce: groups.filter(g => g.name === 'COMMERCE').length,
  }), [groups])

  const deleteGroup = (id: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return
    groupStore.remove(id)
    setGroups(prev => prev.filter(g => g.id !== id))
  }

  const saveGroup = (
    editing: GroupRecord | null,
    data: Pick<GroupRecord, 'classId' | 'className' | 'name'>,
  ) => {
    if (editing) {
      const updated = groupStore.update(editing.id, data)
      setGroups(prev => prev.map(g => g.id === editing.id ? updated : g))
    } else {
      const newG: GroupRecord = {
        id: `grp-${Date.now()}`,
        ...data,
        totalStudents: 0,
        totalSections: 0,
        totalSubjects: 0,
      }
      groupStore.insert(newG)
      setGroups(prev => [...prev, newG])
    }
  }

  return {
    groups, filtered, byClass, stats,
    activeClasses,
    filterClass, setFilterClass,
    filterGroup, setFilterGroup,
    search, setSearch,
    deleteGroup, saveGroup,
  }
}
