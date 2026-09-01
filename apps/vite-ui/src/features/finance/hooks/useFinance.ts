import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  expenseStore,
  paymentStore,
  manualDueStore,
  salaryStore,
} from '@/data/stores'
import {
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
} from '@/features/payments/types'
import type {
  FinanceTransaction,
  FinanceOverviewStats,
  MonthlyFinancialSummary,
  TransactionType,
  TransactionCategory,
  FinancePaymentMethod,
} from '../types'

export interface TransactionFilters {
  type?: TransactionType | 'ALL'
  category?: TransactionCategory | 'ALL'
  payment_method?: FinancePaymentMethod | 'ALL'
  month?: number | 'ALL'
  year?: number
  search?: string
}

export const financeKeys = {
  overview: (month: number, year: number) => ['finance_overview', month, year] as const,
  yearly: (year: number) => ['finance_yearly', year] as const,
  transactions: (filters?: TransactionFilters) => ['finance_transactions', filters] as const,
}

// ─── Fetch Unified Transactions Directly From Primary Stores ───────────────────

export function fetchFinanceTransactions(filters?: TransactionFilters): FinanceTransaction[] {
  // 1. Student Payments (Real Income)
  const allPayments = paymentStore.getAll().filter(p => p.status !== 'REFUNDED')
  const paymentTxs: FinanceTransaction[] = allPayments.map(p => {
    const dateObj = new Date(p.paid_at)
    return {
      id: p.id,
      type: 'INCOME',
      category: 'STUDENT_FEE',
      title: `Fee Collection - ${p.student_name} (${p.class_name ?? 'Class'})`,
      amount: p.total_amount,
      date: p.paid_at.split('T')[0],
      month: dateObj.getMonth() + 1,
      year: dateObj.getFullYear(),
      payment_method: p.payment_method as FinancePaymentMethod,
      reference_id: p.id,
      reference_type: 'PAYMENT',
      invoice_no: p.invoice_number,
      party_name: p.student_name,
      party_id: p.student_id,
      party_role: `Student (Roll ${p.roll_number})`,
      notes: p.note ?? undefined,
      created_at: p.created_at,
    }
  })

  // 2. Paid Teacher Salaries (Real Expense)
  const allSalaries = salaryStore.getAll().filter(s => s.paidAmount > 0)
  const salaryTxs: FinanceTransaction[] = allSalaries.map(s => ({
    id: s.id,
    type: 'EXPENSE',
    category: 'TEACHER_SALARY',
    title: `Salary Disbursal - ${s.teacherName} (${MONTH_NAMES[s.month - 1]} ${s.year})`,
    amount: s.paidAmount,
    date: s.paidDate ?? `${s.year}-${String(s.month).padStart(2, '0')}-05`,
    month: s.month,
    year: s.year,
    payment_method: 'BANK',
    reference_id: s.id,
    reference_type: 'SALARY',
    invoice_no: `SAL-${s.year}-${String(s.month).padStart(2, '0')}-${s.teacherId}`,
    party_name: s.teacherName,
    party_id: s.teacherId,
    party_role: `Teacher (${s.designation})`,
    notes: s.notes,
    created_at: new Date().toISOString(),
  }))

  // 3. Operational Campus Expenses (Real Expense)
  const allExpenses = expenseStore.getAll()
  const expenseTxs: FinanceTransaction[] = allExpenses.map(e => ({
    id: e.id,
    type: 'EXPENSE',
    category: 'OPERATIONAL_EXPENSE',
    title: e.title,
    amount: e.amount,
    date: e.date,
    month: e.month,
    year: e.year,
    payment_method: e.payment_method as FinancePaymentMethod,
    reference_id: e.id,
    reference_type: 'EXPENSE',
    invoice_no: e.invoice_no,
    party_name: e.vendor_name,
    party_role: `Vendor (${e.category_name})`,
    notes: e.notes,
    created_at: e.created_at,
  }))

  let unified = [...paymentTxs, ...salaryTxs, ...expenseTxs].sort(
    (a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at)
  )

  if (filters?.type && filters.type !== 'ALL') {
    unified = unified.filter(t => t.type === filters.type)
  }
  if (filters?.category && filters.category !== 'ALL') {
    unified = unified.filter(t => t.category === filters.category)
  }
  if (filters?.payment_method && filters.payment_method !== 'ALL') {
    unified = unified.filter(t => t.payment_method === filters.payment_method)
  }
  if (filters?.month && filters.month !== 'ALL') {
    unified = unified.filter(t => t.month === filters.month)
  }
  if (filters?.year) {
    unified = unified.filter(t => t.year === filters.year)
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    unified = unified.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.party_name.toLowerCase().includes(q) ||
      (t.invoice_no && t.invoice_no.toLowerCase().includes(q)) ||
      (t.party_role && t.party_role.toLowerCase().includes(q)) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    )
  }

  return unified
}

export function useFinanceTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: financeKeys.transactions(filters as Record<string, unknown> ?? {}),
    queryFn: () => fetchFinanceTransactions(filters),
    staleTime: 0,
  })
}

export function useDeleteFinanceTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      // Check if it's an expense in expenseStore or payment in paymentStore
      const inExpense = expenseStore.getOne(id)
      if (inExpense) {
        expenseStore.remove(id)
      } else {
        const inPayment = paymentStore.getOne(id)
        if (inPayment) {
          paymentStore.remove(id)
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance_transactions'] })
      qc.invalidateQueries({ queryKey: ['finance_overview'] })
      qc.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}

// ─── Fetch Overview Stats & Breakdown (Directly from primary stores) ──────────

export interface CategoryBreakdownItem {
  category: string
  amount: number
  percentage: number
  color: string
}

export function useFinanceOverview(month: number, year: number) {
  return useQuery({
    queryKey: financeKeys.overview(month, year),
    queryFn: () => {
      // 1. Live Income strictly from paymentStore
      const allPayments = paymentStore.getAll().filter(p => p.status !== 'REFUNDED')
      const currentMonthPayments = allPayments.filter(p => {
        const d = new Date(p.paid_at)
        return (d.getMonth() + 1 === month) && (d.getFullYear() === year)
      })
      const totalIncome = currentMonthPayments.reduce((sum, p) => sum + p.total_amount, 0)

      // 2. Live Salary Expenditure strictly from salaryStore
      const currentMonthSalaries = salaryStore.getAll().filter(s => s.month === month && s.year === year && s.paidAmount > 0)
      const totalSalaryPaid = currentMonthSalaries.reduce((sum, s) => sum + s.paidAmount, 0)

      // 3. Live Operational Expenses strictly from expenseStore
      const currentMonthExpenses = expenseStore.getAll().filter(e => e.month === month && e.year === year)
      const totalOperationalExpense = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0)

      const totalExpense = totalSalaryPaid + totalOperationalExpense
      const netBalance = totalIncome - totalExpense

      // Previous Month Comparison
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year

      const prevMonthPayments = allPayments.filter(p => {
        const d = new Date(p.paid_at)
        return (d.getMonth() + 1 === prevMonth) && (d.getFullYear() === prevYear)
      })
      const prevIncome = prevMonthPayments.reduce((sum, p) => sum + p.total_amount, 0)

      const prevSalaries = salaryStore.getAll().filter(s => s.month === prevMonth && s.year === prevYear && s.paidAmount > 0)
      const prevSalaryTotal = prevSalaries.reduce((sum, s) => sum + s.paidAmount, 0)

      const prevExpenses = expenseStore.getAll().filter(e => e.month === prevMonth && e.year === prevYear)
      const prevExpenseTotal = prevExpenses.reduce((sum, e) => sum + e.amount, 0)
      const prevTotalExpense = prevSalaryTotal + prevExpenseTotal

      const incomeGrowthPct = prevIncome > 0 ? Math.round(((totalIncome - prevIncome) / prevIncome) * 100) : 0
      const expenseGrowthPct = prevTotalExpense > 0 ? Math.round(((totalExpense - prevTotalExpense) / prevTotalExpense) * 100) : 0

      // Pending Dues (Students)
      const unpaidStudentDues = manualDueStore.getAll().filter(d => !d.is_paid)
      const pendingStudentDues = unpaidStudentDues.reduce((sum, d) => sum + d.amount, 0)

      // Pending Salaries (Teachers)
      const allMonthTeacherSalaries = salaryStore.getAll().filter(s => s.month === month && s.year === year)
      const pendingSalaryPayable = allMonthTeacherSalaries.reduce((sum, s) => {
        const net = s.baseSalary + s.bonus - s.deduction
        return sum + Math.max(0, net - s.paidAmount)
      }, 0)

      // Expense Categories Breakdown
      const expenseCategoryMap: Record<string, number> = {}
      if (totalSalaryPaid > 0) {
        expenseCategoryMap['Teacher Salaries'] = totalSalaryPaid
      }
      currentMonthExpenses.forEach(e => {
        expenseCategoryMap[e.category_name] = (expenseCategoryMap[e.category_name] ?? 0) + e.amount
      })

      const expenseBreakdown: CategoryBreakdownItem[] = Object.entries(expenseCategoryMap)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
          color: category === 'Teacher Salaries' ? '#6366f1' : '#10b981',
        }))
        .sort((a, b) => b.amount - a.amount)

      // 12-Month Yearly Series for Trend Chart
      const allSalaries = salaryStore.getAll()
      const allExpenses = expenseStore.getAll()

      const yearlySeries: MonthlyFinancialSummary[] = Array.from({ length: 12 }, (_, i) => {
        const m = i + 1

        const mIncome = allPayments.filter(p => {
          const d = new Date(p.paid_at)
          return (d.getMonth() + 1 === m) && (d.getFullYear() === year)
        }).reduce((sum, p) => sum + p.total_amount, 0)

        const mSalaries = allSalaries.filter(s => s.month === m && s.year === year && s.paidAmount > 0)
          .reduce((sum, s) => sum + s.paidAmount, 0)

        const mExpenses = allExpenses.filter(e => e.month === m && e.year === year)
          .reduce((sum, e) => sum + e.amount, 0)

        const mTotalExpense = mSalaries + mExpenses

        return {
          month: m,
          year,
          monthName: MONTH_NAMES_SHORT[i],
          totalIncome: mIncome,
          salaryExpense: mSalaries,
          operationalExpense: mExpenses,
          totalExpense: mTotalExpense,
          netProfit: mIncome - mTotalExpense,
        }
      })

      const totalYearlyIncome = yearlySeries.reduce((s, m) => s + m.totalIncome, 0)
      const totalYearlyExpense = yearlySeries.reduce((s, m) => s + m.totalExpense, 0)
      const totalYearlySalary = yearlySeries.reduce((s, m) => s + m.salaryExpense, 0)
      const totalYearlyOpExp = yearlySeries.reduce((s, m) => s + m.operationalExpense, 0)
      const totalYearlyNet = totalYearlyIncome - totalYearlyExpense

      const stats: FinanceOverviewStats = {
        totalIncome,
        totalExpense,
        totalSalaryPaid,
        totalOperationalExpense,
        netBalance,
        incomeGrowthPct,
        expenseGrowthPct,
        pendingStudentDues,
        pendingSalaryPayable,
        transactionCount: currentMonthPayments.length,
      }

      return {
        stats,
        yearlySeries,
        annualTotals: {
          annualIncome: totalYearlyIncome,
          annualExpense: totalYearlyExpense,
          annualSalary: totalYearlySalary,
          annualOpExp: totalYearlyOpExp,
          annualNetProfit: totalYearlyNet,
        },
        expenseBreakdown,
        monthTxs: fetchFinanceTransactions({ month, year }),
      }
    },
    staleTime: 0,
  })
}
