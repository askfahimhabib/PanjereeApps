import { Link } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  CheckCircle2,
  Wallet,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Scale,
} from 'lucide-react'
import type { DashboardKpis } from '../types'

interface DashboardKpiCardsProps {
  kpis: DashboardKpis
}

export function DashboardKpiCards({ kpis }: DashboardKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* ── 1. Students Card ── */}
      <Link
        to="/students"
        className="group card-surface p-4.5 hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
            <Users size={19} />
          </div>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            {kpis.capacityUtilization}% Cap
          </span>
        </div>

        <div>
          <p className="text-2xl font-extrabold text-zinc-900 tracking-tight">{kpis.totalStudents}</p>
          <p className="text-xs font-semibold text-zinc-500 mt-0.5">Active Students</p>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-100 text-[11px] text-zinc-400">
            <span>{kpis.maleStudents} Male</span>
            <span>•</span>
            <span>{kpis.femaleStudents} Female</span>
          </div>
        </div>
      </Link>

      {/* ── 2. Faculty / Teachers Card ── */}
      <Link
        to="/teachers"
        className="group card-surface p-4.5 hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
            <GraduationCap size={19} />
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            {kpis.teachersOnDutyToday} on duty
          </span>
        </div>

        <div>
          <p className="text-2xl font-extrabold text-zinc-900 tracking-tight">{kpis.totalTeachers}</p>
          <p className="text-xs font-semibold text-zinc-500 mt-0.5">Faculty Members</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 text-[11px] text-zinc-400">
            <span>{kpis.teachersOnLeaveToday} on leave</span>
            {kpis.pendingLeaveCount > 0 && (
              <span className="text-amber-600 font-bold">{kpis.pendingLeaveCount} pending</span>
            )}
          </div>
        </div>
      </Link>

      {/* ── 3. Attendance Pulse Card ── */}
      <Link
        to="/attendance"
        className="group card-surface p-4.5 hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
            <CheckCircle2 size={19} />
          </div>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
            {kpis.todayAttendanceRate !== null ? `${kpis.todayAttendanceRate}%` : 'Pending'}
          </span>
        </div>

        <div>
          <p className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            {kpis.todayAttendanceRate !== null ? `${kpis.todayAttendanceRate}%` : '—'}
          </p>
          <p className="text-xs font-semibold text-zinc-500 mt-0.5">Today Attendance</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 text-[11px] text-zinc-400">
            <span className="text-emerald-600 font-semibold">{kpis.todayPresentCount} Present</span>
            <span className="text-rose-500 font-semibold">{kpis.todayAbsentCount} Absent</span>
          </div>
        </div>
      </Link>

      {/* ── 4. Monthly Fee Collections Card ── */}
      <Link
        to="/payments"
        className="group card-surface p-4.5 hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
            <Wallet size={19} />
          </div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            {kpis.collectionRate}% target
          </span>
        </div>

        <div>
          <p className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            ৳{kpis.collectedThisMonth >= 1000 ? `${(kpis.collectedThisMonth / 1000).toFixed(1)}k` : kpis.collectedThisMonth}
          </p>
          <p className="text-xs font-semibold text-zinc-500 mt-0.5">Collected (Month)</p>
          <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, kpis.collectionRate)}%` }}
            />
          </div>
        </div>
      </Link>

      {/* ── 5. Outstanding Dues Card ── */}
      <Link
        to="/payments"
        className="group card-surface p-4.5 hover:shadow-md hover:border-rose-200 transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
            <AlertTriangle size={19} />
          </div>
          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
            {kpis.defaulterStudentsCount} students
          </span>
        </div>

        <div>
          <p className="text-2xl font-extrabold text-rose-600 tracking-tight">
            ৳{kpis.totalPendingDues >= 1000 ? `${(kpis.totalPendingDues / 1000).toFixed(1)}k` : kpis.totalPendingDues}
          </p>
          <p className="text-xs font-semibold text-zinc-500 mt-0.5">Pending Dues</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 text-[11px] text-zinc-400">
            <span className="text-rose-500 font-medium">Overdue amount</span>
            <ArrowRight size={12} className="text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>

      {/* ── 6. Net Financial Surplus / Flow ── */}
      <Link
        to="/finance"
        className="group card-surface p-4.5 hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-teal-50 text-teal-600 group-hover:scale-105 transition-transform">
            <Scale size={19} />
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
            kpis.netSurplusThisMonth >= 0
              ? 'text-teal-700 bg-teal-50 border-teal-100'
              : 'text-amber-700 bg-amber-50 border-amber-100'
          }`}>
            {kpis.netSurplusThisMonth >= 0 ? 'Surplus' : 'Deficit'}
          </span>
        </div>

        <div>
          <p className={`text-2xl font-extrabold tracking-tight ${
            kpis.netSurplusThisMonth >= 0 ? 'text-zinc-900' : 'text-amber-600'
          }`}>
            ৳{Math.abs(kpis.netSurplusThisMonth) >= 1000 ? `${(kpis.netSurplusThisMonth / 1000).toFixed(1)}k` : kpis.netSurplusThisMonth}
          </p>
          <p className="text-xs font-semibold text-zinc-500 mt-0.5">Net Flow (Month)</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 text-[11px] text-zinc-400">
            <span>Expenses: ৳{(kpis.expensesThisMonth / 1000).toFixed(0)}k</span>
            <TrendingUp size={12} className="text-teal-500" />
          </div>
        </div>
      </Link>
    </div>
  )
}
