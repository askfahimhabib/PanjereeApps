import { useState, useMemo, useCallback } from 'react'
import { batchStore, classStore, studentStore } from '@/data/stores'
import type { Batch, BatchFormData, BatchStatus, TargetExam } from './types'

function generateId() {
  return `bat-${Date.now()}`
}

export function useBatches() {
  const [batches, setBatches] = useState<Batch[]>(() => batchStore.getAll())
  const [filterStatus, setFilterStatus] = useState<BatchStatus | 'ALL'>('ALL')
  const [filterExam, setFilterExam] = useState<TargetExam | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)

  const buildCountMap = () => {
    const map: Record<string, number> = {}
    studentStore.getAll().forEach(s => {
      if (s.batchId) map[s.batchId] = (map[s.batchId] ?? 0) + 1
    })
    return map
  }

  const [liveCountMap, setLiveCountMap] = useState<Record<string, number>>(buildCountMap)

  // Call this after drawer closes to refresh student counts on cards
  const refreshCounts = useCallback(() => {
    setLiveCountMap(buildCountMap())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Enrich each batch with the live student count
  const enriched = useMemo(() =>
    batches.map(b => ({ ...b, totalStudents: liveCountMap[b.id] ?? 0 }))
  , [batches, liveCountMap])

  const filtered = useMemo(() => {
    return enriched.filter(b => {
      if (filterStatus !== 'ALL' && b.status !== filterStatus) return false
      if (filterExam !== 'ALL' && b.examName !== filterExam) return false
      if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [enriched, filterStatus, filterExam, search])

  const stats = useMemo(() => ({
    total: enriched.length,
    ongoing: enriched.filter(b => b.status === 'ONGOING').length,
    upcoming: enriched.filter(b => b.status === 'UPCOMING').length,
    completed: enriched.filter(b => b.status === 'COMPLETED').length,
    totalStudents: enriched.reduce((acc, b) => acc + b.totalStudents, 0),
  }), [enriched])

  const openAddModal = () => { setEditingBatch(null); setIsModalOpen(true) }
  const openEditModal = (b: Batch) => { setEditingBatch(b); setIsModalOpen(true) }
  const closeModal = () => { setIsModalOpen(false); setEditingBatch(null) }

  const saveBatch = (data: BatchFormData) => {
    const resolvedClassName = classStore.getOne(data.classId)?.name ?? data.classId
    if (editingBatch) {
      const updated = batchStore.update(editingBatch.id, { ...data, className: resolvedClassName })
      setBatches(prev => prev.map(b => b.id === editingBatch.id ? updated : b))
    } else {
      const newBatch: Batch = {
        id: generateId(),
        ...data,
        className: resolvedClassName,
        status: 'UPCOMING',
        totalStudents: 0,
        sections: [],
        createdAt: new Date().toISOString(),
      }
      batchStore.insert(newBatch)
      setBatches(prev => [...prev, newBatch])
    }
    closeModal()
  }

  const deleteBatch = (id: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return
    batchStore.remove(id)
    setBatches(prev => prev.filter(b => b.id !== id))
  }

  const updateStatus = (id: string, status: BatchStatus) => {
    const updated = batchStore.update(id, { status })
    setBatches(prev => prev.map(b => b.id === id ? updated : b))
  }

  return {
    filtered, stats, search, filterStatus, filterExam,
    isModalOpen, editingBatch,
    setSearch, setFilterStatus, setFilterExam,
    openAddModal, openEditModal, closeModal,
    saveBatch, deleteBatch, updateStatus,
    refreshCounts,
  }
}
