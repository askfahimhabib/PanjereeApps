import { useState } from 'react'
import { createStore } from '@/lib/localStore'
import type { ClassItem } from '@/features/classes/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export type RolloverStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export interface RolloverLog {
  id: string
  fromYear: string
  toYear: string
  date: string
  status: RolloverStatus
  totalPromoted: number
  totalFailed: number
  totalGraduated: number
  details: string
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

const LOGS_MOCK: RolloverLog[] = [
  { id: 'rl-1', fromYear: '2024', toYear: '2025', date: '2024-12-28', status: 'COMPLETED', totalPromoted: 450, totalFailed: 12, totalGraduated: 85, details: 'Successfully completed' },
]

// ── Stores ────────────────────────────────────────────────────────────────────

const logStore    = createStore<RolloverLog>('rollover-logs')
const classStore  = createStore<ClassItem>('classes')

logStore.seed(LOGS_MOCK)

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useClassRollover() {
  const currentYear = new Date().getFullYear()
  const nextYear    = currentYear + 1

  const [logs, setLogs]           = useState<RolloverLog[]>(() => logStore.getAll())
  const [step, setStep]           = useState<1 | 2 | 3>(1)
  const [isProcessing, setIsProcessing] = useState(false)

  // Live active classes from store (dynamic, not hardcoded mockClasses)
  const classes = classStore
    .getAll()
    .map(c => ({ ...c, isActive: c.isActive ?? true }))
    .filter(c => c.isActive)
    .sort((a, b) => a.numericName - b.numericName)

  const processRollover = () => {
    setStep(3)
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      const newLog: RolloverLog = {
        id: `rl-${Date.now()}`,
        fromYear: currentYear.toString(),
        toYear: nextYear.toString(),
        date: new Date().toISOString().split('T')[0],
        status: 'COMPLETED',
        totalPromoted: classes.reduce((a, c) => a + (c.totalStudents ?? 0), 0) - 45,
        totalFailed: 15,
        totalGraduated: 30,
        details: 'System auto rollover',
      }
      logStore.insert(newLog)
      setLogs(prev => [newLog, ...prev])
    }, 2000)
  }

  return {
    currentYear, nextYear,
    classes,
    logs,
    step, setStep,
    isProcessing,
    processRollover,
  }
}
