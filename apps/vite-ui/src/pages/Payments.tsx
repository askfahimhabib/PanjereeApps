import { useState } from 'react'
import { Plus, Settings2, Wallet, RefreshCw, ToggleLeft, ToggleRight, Pencil, Trash2 } from 'lucide-react'
import { usePayments, usePaymentStats, type PaymentFilters } from '@/features/payments/hooks/usePayments'
import { useFeeStructures, useCreateFeeStructure, useUpdateFeeStructure, useDeleteFeeStructure, useToggleFeeStructureActive } from '@/features/payments/hooks/useFeeStructures'
import { PaymentStatsCards } from '@/features/payments/components/PaymentStatsCards'
import { PaymentTable } from '@/features/payments/components/PaymentTable'
import { DueStudentsList } from '@/features/payments/components/DueStudentsList'
import { CollectFeeModal } from '@/features/payments/components/CollectFeeModal'
import { FeeStructureModal } from '@/features/payments/components/FeeStructureModal'
import { FEE_FREQUENCY_LABELS, formatCurrency } from '@/features/payments/types'
import type { FeeStructure } from '@/features/payments/types'
import type { Student } from '@/features/students/types'

type Tab = 'transactions' | 'dues' | 'structures'

export function Payments() {
  const [activeTab, setActiveTab] = useState<Tab>('transactions')
  const [filters, setFilters] = useState<PaymentFilters>({})
  const [collectOpen, setCollectOpen] = useState(false)
  const [preselectedStudent, setPreselectedStudent] = useState<Student | null>(null)
  const [structureModalOpen, setStructureModalOpen] = useState(false)
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null)

  const { data: payments = [], isLoading: paymentsLoading } = usePayments(filters)
  const { data: stats, isLoading: statsLoading } = usePaymentStats()
  const { data: structures = [], isLoading: structuresLoading } = useFeeStructures()

  const createStructure = useCreateFeeStructure()
  const updateStructure = useUpdateFeeStructure()
  const deleteStructure = useDeleteFeeStructure()
  const toggleStructure = useToggleFeeStructureActive()

  const handleCollectForStudent = (student: Student) => {
    setPreselectedStudent(student)
    setCollectOpen(true)
  }

  const handleCloseCollect = () => {
    setCollectOpen(false)
    setPreselectedStudent(null)
  }

  const handleOpenNewStructure = () => {
    setEditingStructure(null)
    setStructureModalOpen(true)
  }

  const handleEditStructure = (s: FeeStructure) => {
    setEditingStructure(s)
    setStructureModalOpen(true)
  }

  const handleDeleteStructure = (id: string) => {
    if (confirm('Delete this fee structure? This cannot be undone.')) {
      deleteStructure.mutate(id)
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'transactions', label: 'Transactions' },
    { key: 'dues', label: 'Due Students' },
    { key: 'structures', label: 'Fee Structures' },
  ]

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments & Fees</h1>
          <p className="text-zinc-600 mt-1 text-sm flex items-center gap-1.5">
            <Wallet size={12} className="text-emerald-400" />
            Collect fees, track dues, manage fee structures
          </p>
        </div>
        <button
          onClick={() => { setPreselectedStudent(null); setCollectOpen(true) }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm shadow-lg shadow-emerald-500/20"
        >
          <Plus size={17} />
          Collect Fee
        </button>
      </div>

      {/* Stats */}
      <PaymentStatsCards stats={stats} isLoading={statsLoading} />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-xl w-fit border border-zinc-100">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[var(--color-primary)] text-white shadow-sm shadow-green-200'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}

      {/* ── Transactions Tab ─────────────────────────────────────────────── */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <PaymentTable
            records={payments}
            isLoading={paymentsLoading}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      )}

      {/* ── Dues Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'dues' && (
        <DueStudentsList onCollect={handleCollectForStudent} />
      )}

      {/* ── Fee Structures Tab ────────────────────────────────────────────── */}
      {activeTab === 'structures' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-600">
              {structures.length} structure{structures.length !== 1 ? 's' : ''} defined
            </p>
            <button
              onClick={handleOpenNewStructure}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              <Plus size={14} /> New Structure
            </button>
          </div>

          {structuresLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-zinc-50 animate-pulse" />
              ))}
            </div>
          ) : structures.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <Settings2 size={40} className="mb-3 opacity-25" />
              <p className="text-sm font-medium text-zinc-500">No fee structures yet</p>
              <p className="text-xs text-zinc-400 mt-1">Create a structure to start collecting fees</p>
              <button
                onClick={handleOpenNewStructure}
                className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                + Create First Structure
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {structures.map(s => (
                <div
                  key={s.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    s.is_active
                      ? 'bg-white border-emerald-200 shadow-sm'
                      : 'bg-zinc-50 border-zinc-200 opacity-40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-zinc-800">{s.name}</h3>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        {s.target_type === 'CLASS'
                          ? `🏫 ${s.class_name ?? s.class_id ?? '—'}`
                          : `📚 ${s.batch_name ?? s.batch_id ?? '—'}`
                        }
                        {!s.is_active && <span className="ml-2 text-amber-400">• Inactive</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleStructure.mutate({ id: s.id, is_active: !s.is_active })}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                        title={s.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {s.is_active ? <ToggleRight size={18} className="text-emerald-400" /> : <ToggleLeft size={18} />}
                      </button>
                      <button
                        onClick={() => handleEditStructure(s)}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-800 hover:bg-zinc-50 transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteStructure(s.id)}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Fee Items Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {s.fee_items.map(item => (
                      <div
                        key={item.id}
                        className="bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg px-3 py-2"
                      >
                        <p className="text-xs font-semibold text-zinc-800">{item.label}</p>
                        <p className="text-sm font-bold text-emerald-400 mt-0.5">{formatCurrency(item.amount)}</p>
                        <p className="text-[10px] text-zinc-800 mt-0.5">
                          {FEE_FREQUENCY_LABELS[item.frequency]}
                          {item.due_day ? ` · Due: ${item.due_day}th` : ''}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
                    <span className="text-xs text-zinc-800">
                      {s.fee_items.length} fee item{s.fee_items.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      {formatCurrency(s.fee_items.reduce((sum, it) => sum + it.amount, 0))} / cycle
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CollectFeeModal
        open={collectOpen}
        preselectedStudent={preselectedStudent}
        onClose={handleCloseCollect}
      />

      <FeeStructureModal
        open={structureModalOpen}
        editing={editingStructure}
        onClose={() => { setStructureModalOpen(false); setEditingStructure(null) }}
        onSave={dto => {
          if (editingStructure) {
            updateStructure.mutate(
              { id: editingStructure.id, dto },
              { onSuccess: () => { setStructureModalOpen(false); setEditingStructure(null) } }
            )
          } else {
            createStructure.mutate(dto, {
              onSuccess: () => { setStructureModalOpen(false) }
            })
          }
        }}
        isSaving={createStructure.isPending || updateStructure.isPending}
      />
    </div>
  )
}
