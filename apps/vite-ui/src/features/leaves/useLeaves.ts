import { useState, useMemo } from 'react'
import { leaveStore } from '@/data/stores'

// ── Types ─────────────────────────────────────────────────────────────────────

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type LeaveApplicantType = 'TEACHER' | 'STUDENT'

export interface LeaveRequest {
  id: string
  applicantId: string
  applicantName: string
  applicantType: LeaveApplicantType
  designation?: string
  className?: string
  fromDate: string
  toDate: string
  reason: string
  status: LeaveStatus
  reviewedBy?: string
  reviewNote?: string
  appliedAt: string
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useLeaves() {
  const [records, setRecords] = useState<LeaveRequest[]>(() => leaveStore.getAll())
  const [tab, setTab] = useState<LeaveStatus | 'ALL'>('PENDING')
  const [typeFilter, setTypeFilter] = useState<LeaveApplicantType | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() =>
    records.filter(r => {
      if (tab !== 'ALL' && r.status !== tab) return false
      if (typeFilter !== 'ALL' && r.applicantType !== typeFilter) return false
      if (search && !r.applicantName.includes(search) && !r.reason.includes(search)) return false
      return true
    }).sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()),
  [records, tab, typeFilter, search])

  const stats = {
    pending:  records.filter(r => r.status === 'PENDING').length,
    approved: records.filter(r => r.status === 'APPROVED').length,
    rejected: records.filter(r => r.status === 'REJECTED').length,
  }

  const updateLeave = (id: string, status: LeaveStatus, note?: string) => {
    const updated = leaveStore.update(id, { status, reviewNote: note, reviewedBy: 'Admin' })
    setRecords(prev => prev.map(r => r.id === id ? updated : r))
  }

  return {
    filtered, stats,
    tab, setTab,
    typeFilter, setTypeFilter,
    search, setSearch,
    updateLeave,
  }
}
