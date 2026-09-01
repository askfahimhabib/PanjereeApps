import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  expenseStore,
  expenseCategoryStore,
  financeTransactionStore,
} from '@/data/stores'
import {
  generateExpenseInvoiceNo,
  type ExpenseRecord,
  type ExpenseCategoryItem,
  type CreateExpenseDto,
  type FinanceTransaction,
} from '../types'

export interface ExpenseFilters {
  month?: number
  year?: number
  category_id?: string
  search?: string
  payment_method?: string
}

export const expenseKeys = {
  all: ['finance_expenses'] as const,
  filtered: (filters?: ExpenseFilters) => ['finance_expenses', filters] as const,
  categories: ['finance_expense_categories'] as const,
}

// ─── Fetch Expenses ───────────────────────────────────────────────────────────

function fetchExpenses(filters?: ExpenseFilters): ExpenseRecord[] {
  let records = expenseStore.getAll().sort((a, b) => b.date.localeCompare(a.date))

  if (filters?.month) {
    records = records.filter(r => r.month === filters.month)
  }
  if (filters?.year) {
    records = records.filter(r => r.year === filters.year)
  }
  if (filters?.category_id && filters.category_id !== 'ALL') {
    records = records.filter(r => r.category_id === filters.category_id)
  }
  if (filters?.payment_method && filters.payment_method !== 'ALL') {
    records = records.filter(r => r.payment_method === filters.payment_method)
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    records = records.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.vendor_name.toLowerCase().includes(q) ||
      r.invoice_no.toLowerCase().includes(q) ||
      r.category_name.toLowerCase().includes(q) ||
      (r.receipt_no && r.receipt_no.toLowerCase().includes(q))
    )
  }

  return records
}

export function useExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: expenseKeys.filtered(filters ?? {}),
    queryFn: () => fetchExpenses(filters),
    staleTime: 0,
  })
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useExpenseCategories() {
  return useQuery({
    queryKey: expenseKeys.categories,
    queryFn: () => expenseCategoryStore.getAll(),
    staleTime: 0,
  })
}

export function useCreateExpenseCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (category: Omit<ExpenseCategoryItem, 'id' | 'is_custom'>) => {
      const newCat: ExpenseCategoryItem = {
        ...category,
        id: `cat-custom-${crypto.randomUUID().slice(0, 8)}`,
        is_custom: true,
      }
      return expenseCategoryStore.insert(newCat)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.categories })
    },
  })
}

export function useDeleteExpenseCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      expenseCategoryStore.remove(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.categories })
    },
  })
}

// ─── Create Expense ───────────────────────────────────────────────────────────

async function createExpense(dto: CreateExpenseDto): Promise<ExpenseRecord> {
  const dateObj = new Date(dto.date)
  const month = dateObj.getMonth() + 1
  const year = dateObj.getFullYear()
  const invoiceNo = generateExpenseInvoiceNo()

  const categories = expenseCategoryStore.getAll()
  const category = categories.find(c => c.id === dto.category_id)
  const categoryName = category ? category.name : 'Operational Expense'

  const expenseId = crypto.randomUUID()

  const newExpense: ExpenseRecord = {
    id: expenseId,
    invoice_no: invoiceNo,
    title: dto.title,
    category_id: dto.category_id,
    category_name: categoryName,
    amount: dto.amount,
    date: dto.date,
    month,
    year,
    vendor_name: dto.vendor_name,
    payment_method: dto.payment_method,
    receipt_no: dto.receipt_no ?? '',
    notes: dto.notes ?? '',
    created_by: 'Admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Insert in Expense store
  const savedExpense = expenseStore.insert(newExpense)

  // Also log into Finance Transactions store
  const newTx: FinanceTransaction = {
    id: crypto.randomUUID(),
    type: 'EXPENSE',
    category: 'OPERATIONAL_EXPENSE',
    title: dto.title,
    amount: dto.amount,
    date: dto.date,
    month,
    year,
    payment_method: dto.payment_method,
    reference_id: expenseId,
    reference_type: 'EXPENSE',
    invoice_no: invoiceNo,
    party_name: dto.vendor_name,
    party_role: categoryName,
    notes: dto.notes,
    created_at: new Date().toISOString(),
  }
  financeTransactionStore.insert(newTx)

  return savedExpense
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.all })
      qc.invalidateQueries({ queryKey: ['finance_transactions'] })
      qc.invalidateQueries({ queryKey: ['finance_overview'] })
    },
  })
}

// ─── Update Expense ───────────────────────────────────────────────────────────

async function updateExpense({ id, dto }: { id: string; dto: Partial<CreateExpenseDto> }): Promise<ExpenseRecord> {
  const existing = expenseStore.getOne(id)
  if (!existing) throw new Error('Expense not found')

  const dateObj = dto.date ? new Date(dto.date) : new Date(existing.date)
  const month = dateObj.getMonth() + 1
  const year = dateObj.getFullYear()

  let categoryName = existing.category_name
  if (dto.category_id) {
    const cat = expenseCategoryStore.getOne(dto.category_id)
    if (cat) categoryName = cat.name
  }

  const updated = expenseStore.update(id, {
    ...dto,
    category_name: categoryName,
    month,
    year,
    updated_at: new Date().toISOString(),
  })

  // Update corresponding transaction if exists
  const existingTx = financeTransactionStore.getWhere(tx => tx.reference_id === id)[0]
  if (existingTx) {
    financeTransactionStore.update(existingTx.id, {
      title: updated.title,
      amount: updated.amount,
      date: updated.date,
      month: updated.month,
      year: updated.year,
      payment_method: updated.payment_method,
      party_name: updated.vendor_name,
      party_role: updated.category_name,
      notes: updated.notes,
    })
  }

  return updated
}

export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.all })
      qc.invalidateQueries({ queryKey: ['finance_transactions'] })
      qc.invalidateQueries({ queryKey: ['finance_overview'] })
    },
  })
}

// ─── Delete Expense ───────────────────────────────────────────────────────────

async function deleteExpense(id: string): Promise<void> {
  expenseStore.remove(id)
  // Also remove linked transaction
  const linkedTx = financeTransactionStore.getWhere(tx => tx.reference_id === id)[0]
  if (linkedTx) {
    financeTransactionStore.remove(linkedTx.id)
  }
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.all })
      qc.invalidateQueries({ queryKey: ['finance_transactions'] })
      qc.invalidateQueries({ queryKey: ['finance_overview'] })
    },
  })
}
