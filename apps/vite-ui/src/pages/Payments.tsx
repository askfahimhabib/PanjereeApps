import { useState } from 'react'
import {
  Plus,
  Settings2,
  Wallet,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  Zap,
  Sparkles,
  Coins,
  FileText,
  Users,
  Award,
} from 'lucide-react'
import { usePayments, usePaymentStats, type PaymentFilters } from '@/features/payments/hooks/usePayments'
import {
  useFeeStructures,
  useCreateFeeStructure,
  useUpdateFeeStructure,
  useDeleteFeeStructure,
  useToggleFeeStructureActive,
} from '@/features/payments/hooks/useFeeStructures'
import { PaymentStatsCards } from '@/features/payments/components/PaymentStatsCards'
import { PaymentTable } from '@/features/payments/components/PaymentTable'
import { DueStudentsList } from '@/features/payments/components/DueStudentsList'
import { QuickCollectModal } from '@/features/payments/components/QuickCollectModal'
import { MonthlyDueGeneratorModal } from '@/features/payments/components/MonthlyDueGeneratorModal'
import { DailyCashRegisterCard } from '@/features/payments/components/DailyCashRegisterCard'
import { StudentWaiversTab } from '@/features/payments/components/StudentWaiversTab'
import { StudentLedgerListTab } from '@/features/payments/components/StudentLedgerListTab'
import { FeeStructureModal } from '@/features/payments/components/FeeStructureModal'
import { FEE_FREQUENCY_LABELS, formatCurrency } from '@/features/payments/types'
import type { FeeStructure } from '@/features/payments/types'
import type { Student } from '@/features/students/types'

type Tab = 'transactions' | 'cash_register' | 'ledgers' | 'dues' | 'waivers' | 'structures'

export function Payments() {
  const [activeTab, setActiveTab] = useState<Tab>('ledgers')
  const [filters, setFilters] = useState<PaymentFilters>({})

  // Modals
  const [quickCollectOpen, setQuickCollectOpen] = useState(false)
  const [preselectedStudent, setPreselectedStudent] = useState<Student | null>(null)
  const [monthlyBillingOpen, setMonthlyBillingOpen] = useState(false)
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
    setQuickCollectOpen(true)
  }

  const handleCloseQuickCollect = () => {
    setQuickCollectOpen(false)
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

  const TABS: { key: Tab; label: string; icon: typeof Wallet; count?: number; countColor?: string }[] = [
    { key: 'ledgers', label: 'Student Ledgers', icon: FileText },
    { key: 'dues', label: 'Dues & Defaulters', icon: Users, count: stats?.unpaidDuesCount, countColor: 'bg-rose-100 text-rose-700' },
    { key: 'transactions', label: 'Transactions', icon: Wallet, count: stats?.totalTransactions },
    { key: 'cash_register', label: 'Cash Register', icon: Coins },
    { key: 'waivers', label: 'Waivers', icon: Award },
    { key: 'structures', label: 'Fee Structures', icon: Settings2, count: structures.length },
  ]

  return (
    <div className="space-y-5">
      {/* ── Page Header & Quick POS Buttons ───────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Student Fee Management</h1>
          <p className="text-zinc-500 mt-1 text-sm flex items-center gap-1.5">
            <Wallet size={14} className="text-emerald-600" />
            POS fast fee collection, 1-click monthly billing, 12-month ledgers & dual-copy receipts
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMonthlyBillingOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles size={14} />
            📅 Automated Monthly Billing
          </button>

          <button
            onClick={() => {
              setPreselectedStudent(null)
              setQuickCollectOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Zap size={15} />
            ⚡ Quick POS Collection
          </button>
        </div>
      </div>

      {/* ── Compact Operational KPI Strip ────────────────────── */}
      <PaymentStatsCards
        stats={stats}
        isLoading={statsLoading}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* ── Responsive Full-Width Segmented Tab Navigation ───── */}
      <div className="w-full bg-zinc-100/90 p-1.5 rounded-2xl border border-zinc-200/70 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 shadow-2xs">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                isActive
                  ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/80'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/60'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-emerald-600' : 'text-zinc-400'} />
              <span className="truncate">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${tab.countColor || 'bg-zinc-200 text-zinc-700'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Tab Content ───────────────────────────────────────── */}

      {/* Tab 1: Collection Ledger */}
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

      {/* Tab 2: Daily Cash Register */}
      {activeTab === 'cash_register' && (
        <DailyCashRegisterCard />
      )}

      {/* Tab 3: Student 12-Month Ledgers */}
      {activeTab === 'ledgers' && (
        <StudentLedgerListTab onQuickCollect={handleCollectForStudent} />
      )}

      {/* Tab 4: Dues & Defaulters */}
      {activeTab === 'dues' && (
        <DueStudentsList onCollect={handleCollectForStudent} />
      )}

      {/* Tab 5: Scholarships & Waivers */}
      {activeTab === 'waivers' && (
        <StudentWaiversTab />
      )}

      {/* Tab 6: Fee Structures */}
      {activeTab === 'structures' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-600 font-medium">
              {structures.length} fee structure{structures.length !== 1 ? 's' : ''} configured
            </p>
            <button
              onClick={handleOpenNewStructure}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer"
            >
              <Plus size={14} /> + New Structure
            </button>
          </div>

          {structuresLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-zinc-50 animate-pulse" />
              ))}
            </div>
          ) : structures.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400 bg-white rounded-2xl border border-zinc-100">
              <Settings2 size={40} className="mb-3 opacity-25 text-zinc-400" />
              <p className="text-sm font-bold text-zinc-700">No fee structures defined yet</p>
              <p className="text-xs text-zinc-400 mt-1">Create a structure to automate class-wide fee billing</p>
              <button
                onClick={handleOpenNewStructure}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                + Create First Structure
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {structures.map((s) => (
                <div
                  key={s.id}
                  className={`rounded-3xl border p-5 transition-all ${
                    s.is_active
                      ? 'bg-white border-zinc-200/80 shadow-sm'
                      : 'bg-zinc-50 border-zinc-200 opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900">{s.name}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {s.target_type === 'CLASS'
                          ? `🏫 Target: ${s.class_name ?? s.class_id ?? 'All Classes'}`
                          : `📚 Target: ${s.batch_name ?? s.batch_id ?? 'All Batches'}`}
                        {!s.is_active && <span className="ml-2 text-amber-600 font-bold">• Inactive</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleStructure.mutate({ id: s.id, is_active: !s.is_active })}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                        title={s.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {s.is_active ? <ToggleRight size={20} className="text-emerald-600" /> : <ToggleLeft size={20} />}
                      </button>
                      <button
                        onClick={() => handleEditStructure(s)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all cursor-pointer"
                        title="Edit Structure"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteStructure(s.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete Structure"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Fee Items Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {s.fee_items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2.5"
                      >
                        <p className="text-xs font-semibold text-zinc-700 truncate">{item.label}</p>
                        <p className="text-sm font-extrabold text-emerald-700 font-mono mt-0.5">
                          {formatCurrency(item.amount)}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {FEE_FREQUENCY_LABELS[item.frequency]}
                          {item.due_day ? ` • Due on ${item.due_day}th` : ''}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
                    <span className="text-xs text-zinc-500 font-medium">
                      {s.fee_items.length} item{s.fee_items.length !== 1 ? 's' : ''} in package
                    </span>
                    <span className="text-sm font-extrabold text-emerald-700 font-mono">
                      {formatCurrency(s.fee_items.reduce((sum, it) => sum + it.amount, 0))} / month
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────── */}
      <QuickCollectModal
        open={quickCollectOpen}
        preselectedStudent={preselectedStudent}
        onClose={handleCloseQuickCollect}
      />

      <MonthlyDueGeneratorModal
        open={monthlyBillingOpen}
        onClose={() => setMonthlyBillingOpen(false)}
      />

      <FeeStructureModal
        open={structureModalOpen}
        editing={editingStructure}
        onClose={() => {
          setStructureModalOpen(false)
          setEditingStructure(null)
        }}
        onSave={(dto) => {
          if (editingStructure) {
            updateStructure.mutate(
              { id: editingStructure.id, dto },
              {
                onSuccess: () => {
                  setStructureModalOpen(false)
                  setEditingStructure(null)
                },
              }
            )
          } else {
            createStructure.mutate(dto, {
              onSuccess: () => {
                setStructureModalOpen(false)
              },
            })
          }
        }}
        isSaving={createStructure.isPending || updateStructure.isPending}
      />
    </div>
  )
}
