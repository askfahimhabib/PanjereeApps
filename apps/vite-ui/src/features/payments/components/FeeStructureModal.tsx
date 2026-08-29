import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Save, Plus, Trash2 } from 'lucide-react'
import type { FeeStructure, CreateFeeStructureDto, FeeType, FeeFrequency } from '../types'
import {
  FEE_TYPE_LABELS,
  FEE_FREQUENCY_LABELS,
} from '../types'
import { classStore } from '@/data/stores'

const mockClasses = classStore.getAll()

interface Props {
  open: boolean
  editing?: FeeStructure | null
  onClose: () => void
  onSave: (dto: CreateFeeStructureDto) => void
  isSaving?: boolean
}

interface DraftItem {
  tempId: string
  fee_type: FeeType
  label: string
  amount: string
  frequency: FeeFrequency
  due_day: string
}

const MOCK_BATCHES = [
  { id: 'bat1', name: 'SSC 2026 Batch' },
  { id: 'bat2', name: 'HSC 2026 Batch' },
]

const FEE_TYPES = Object.entries(FEE_TYPE_LABELS) as [FeeType, string][]
const FREQUENCIES = Object.entries(FEE_FREQUENCY_LABELS) as [FeeFrequency, string][]

function blankItem(): DraftItem {
  return {
    tempId: crypto.randomUUID(),
    fee_type: 'TUITION',
    label: 'Tuition Fee',
    amount: '',
    frequency: 'MONTHLY',
    due_day: '5',
  }
}

export function FeeStructureModal({ open, editing, onClose, onSave, isSaving }: Props) {
  const [name, setName] = useState('')
  const [targetType, setTargetType] = useState<'CLASS' | 'BATCH'>('CLASS')
  const [classId, setClassId] = useState('')
  const [batchId, setBatchId] = useState('')
  const [items, setItems] = useState<DraftItem[]>([blankItem()])

  // Reset / populate when modal opens
  useEffect(() => {
    if (open) {
      if (editing) {
        setName(editing.name)
        setTargetType(editing.target_type)
        setClassId(editing.class_id ?? '')
        setBatchId(editing.batch_id ?? '')
        setItems(
          editing.fee_items.map(fi => ({
            tempId: fi.id,
            fee_type: fi.fee_type,
            label: fi.label,
            amount: String(fi.amount),
            frequency: fi.frequency,
            due_day: fi.due_day != null ? String(fi.due_day) : '',
          }))
        )
      } else {
        setName('')
        setTargetType('CLASS')
        setClassId('')
        setBatchId('')
        setItems([blankItem()])
      }
    }
  }, [open, editing])

  const updateItem = (tempId: string, patch: Partial<DraftItem>) =>
    setItems(prev => prev.map(it => it.tempId === tempId ? { ...it, ...patch } : it))

  const removeItem = (tempId: string) =>
    setItems(prev => prev.filter(it => it.tempId !== tempId))

  const handleFeeTypeChange = (tempId: string, feeType: FeeType) => {
    updateItem(tempId, { fee_type: feeType, label: FEE_TYPE_LABELS[feeType] })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const valid = items.every(it => it.label.trim() && Number(it.amount) > 0)
    if (!valid || !name.trim()) return

    const selectedClass = mockClasses.find(c => c.id === classId)
    const selectedBatch = MOCK_BATCHES.find(b => b.id === batchId)

    const dto: CreateFeeStructureDto = {
      name,
      target_type: targetType,
      class_id: targetType === 'CLASS' ? classId : undefined,
      batch_id: targetType === 'BATCH' ? batchId : undefined,
      class_name: targetType === 'CLASS' ? selectedClass?.name : undefined,
      batch_name: targetType === 'BATCH' ? selectedBatch?.name : undefined,
      fee_items: items.map(it => ({
        fee_type: it.fee_type,
        label: it.label.trim(),
        amount: Number(it.amount),
        frequency: it.frequency,
        due_day: it.frequency === 'MONTHLY' && it.due_day ? Number(it.due_day) : null,
      })),
    }
    onSave(dto)
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-zinc-100 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">
              {editing ? 'Edit Fee Structure' : 'New Fee Structure'}
            </h3>
            <p className="text-xs text-zinc-600 mt-0.5">Define fees for a class or batch</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Structure Name *</label>
            <input
              type="text"
              placeholder="e.g. Class 10 - 2026 Fee Structure"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg px-3 py-2.5 text-sm text-zinc-800 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-2">Target *</label>
            <div className="flex gap-2">
              {(['CLASS', 'BATCH'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTargetType(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    targetType === t
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-zinc-100 text-zinc-600 hover:border-zinc-100'
                  }`}
                >
                  {t === 'CLASS' ? '🏫 Class' : '📚 Exam Batch'}
                </button>
              ))}
            </div>
          </div>

          {/* Class / Batch selector */}
          {targetType === 'CLASS' ? (
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Select Class *</label>
              <select
                value={classId}
                onChange={e => {
                  const selectedClassId = e.target.value
                  setClassId(selectedClassId)
                  // Auto-fill tuition amount from class feeMonthly
                  const cls = mockClasses.find(c => c.id === selectedClassId)
                  if (cls?.feeMonthly && items.length === 1 && items[0].fee_type === 'TUITION' && !items[0].amount) {
                    setItems(prev => prev.map((it, idx) =>
                      idx === 0 ? { ...it, amount: String(cls.feeMonthly) } : it
                    ))
                  }
                }}
                required
                className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="">— Select Class —</option>
                {mockClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Select Batch *</label>
              <select
                value={batchId}
                onChange={e => setBatchId(e.target.value)}
                required
                className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-100 rounded-lg px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="">— Select Batch —</option>
                {MOCK_BATCHES.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Fee Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-zinc-600">Fee Items *</label>
              <button
                type="button"
                onClick={() => setItems(prev => [...prev, blankItem()])}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Plus size={13} /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.tempId} className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-600">Item {idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.tempId)}
                        className="text-zinc-800 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Fee Type */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-600 mb-1">Fee Type</label>
                      <select
                        value={item.fee_type}
                        onChange={e => handleFeeTypeChange(item.tempId, e.target.value as FeeType)}
                        className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
                      >
                        {FEE_TYPES.map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-600 mb-1">Frequency</label>
                      <select
                        value={item.frequency}
                        onChange={e => updateItem(item.tempId, { frequency: e.target.value as FeeFrequency })}
                        className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
                      >
                        {FREQUENCIES.map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Label */}
                    <div>
                      <label className="block text-[10px] text-zinc-600 mb-1">Display Label</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={e => updateItem(item.tempId, { label: e.target.value })}
                        placeholder="Label"
                        required
                        className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    {/* Amount */}
                    <div>
                      <label className="block text-[10px] text-zinc-600 mb-1">Amount (৳)</label>
                      <input
                        type="number"
                        min={1}
                        value={item.amount}
                        onChange={e => updateItem(item.tempId, { amount: e.target.value })}
                        placeholder="0"
                        required
                        className="w-full bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {item.frequency === 'MONTHLY' && (
                    <div>
                      <label className="block text-[10px] text-zinc-600 mb-1">Due Day (day of month)</label>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={item.due_day}
                        onChange={e => updateItem(item.tempId, { due_day: e.target.value })}
                        placeholder="e.g. 5"
                        className="w-32 bg-white border border-zinc-100 rounded-md px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total preview */}
          {items.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="text-xs text-emerald-300">Total per cycle</span>
              <span className="text-sm font-bold text-emerald-400">
                ৳ {items.reduce((s, it) => s + (Number(it.amount) || 0), 0).toLocaleString('en-BD')}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm transition-all"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : (editing ? 'Update Structure' : 'Create Structure')}
          </button>
        </form>
      </div>
    </div>
  , document.body
  )
}
