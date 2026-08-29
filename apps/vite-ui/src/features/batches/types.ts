// ============================================================
//  Batches Module — Types & Mock Data
// ============================================================

export type BatchStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED'
export type TargetExam = 'SSC' | 'HSC' | 'JSC' | 'PSC' | 'OTHERS'

export interface Batch {
  id: string
  name: string
  examName: TargetExam
  examYear: number
  classId: string
  className: string
  startDate: string
  endDate: string
  status: BatchStatus
  totalStudents: number
  sections: BatchSection[]
  monthlyFee: number
  createdAt: string
}

export interface BatchSection {
  id: string
  batchId: string
  name: string
  capacity: number
  enrolled: number
}

export interface BatchFormData {
  name: string
  examName: TargetExam
  examYear: number
  classId: string
  startDate: string
  endDate: string
  monthlyFee: number
}

export const STATUS_CONFIG: Record<BatchStatus, { label: string; bg: string; text: string; dot: string }> = {
  UPCOMING:  { label: 'Upcoming',  bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  ONGOING:   { label: 'Ongoing',   bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  COMPLETED: { label: 'Completed', bg: 'bg-zinc-100',  text: 'text-zinc-600',   dot: 'bg-zinc-400' },
}

export const EXAM_LABELS: Record<TargetExam, string> = {
  SSC: 'SSC',
  HSC: 'HSC',
  JSC: 'JSC',
  PSC: 'PSC',
  OTHERS: 'Others',
}

export const MOCK_BATCHES: Batch[] = [
  {
    id: 'bat-001',
    name: 'SSC Special Batch 2025',
    examName: 'SSC',
    examYear: 2025,
    classId: 'cls-10',
    className: 'Class 10',
    startDate: '2024-06-01',
    endDate: '2025-02-28',
    status: 'ONGOING',
    totalStudents: 45,
    monthlyFee: 1500,
    sections: [
      { id: 'bsec-001', batchId: 'bat-001', name: 'Section A', capacity: 25, enrolled: 23 },
      { id: 'bsec-002', batchId: 'bat-001', name: 'Section B', capacity: 25, enrolled: 22 },
    ],
    createdAt: '2024-05-15',
  },
  {
    id: 'bat-002',
    name: 'HSC Science Batch 2025',
    examName: 'HSC',
    examYear: 2025,
    classId: 'cls-12',
    className: 'Class 12',
    startDate: '2024-07-01',
    endDate: '2025-03-31',
    status: 'ONGOING',
    totalStudents: 30,
    monthlyFee: 2000,
    sections: [
      { id: 'bsec-003', batchId: 'bat-002', name: 'Science A', capacity: 30, enrolled: 30 },
    ],
    createdAt: '2024-06-20',
  },
  {
    id: 'bat-003',
    name: 'JSC Batch 2024',
    examName: 'JSC',
    examYear: 2024,
    classId: 'cls-8',
    className: 'Class 8',
    startDate: '2024-01-01',
    endDate: '2024-11-30',
    status: 'COMPLETED',
    totalStudents: 38,
    monthlyFee: 1000,
    sections: [
      { id: 'bsec-004', batchId: 'bat-003', name: 'Batch A', capacity: 40, enrolled: 38 },
    ],
    createdAt: '2023-12-01',
  },
  {
    id: 'bat-004',
    name: 'SSC Advance Batch 2026',
    examName: 'SSC',
    examYear: 2026,
    classId: 'cls-9',
    className: 'Class 9',
    startDate: '2025-01-01',
    endDate: '2026-02-28',
    status: 'UPCOMING',
    totalStudents: 0,
    monthlyFee: 1500,
    sections: [],
    createdAt: '2024-12-01',
  },
]
