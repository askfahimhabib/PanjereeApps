import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Pencil,
  Sparkles,
  Users,
  Trophy,
  CalendarDays,
  Clock,
  CreditCard,
  BookOpen,
  Printer,
} from 'lucide-react'
import { BreadcrumbNav } from '../features/classes/components/shared/BreadcrumbNav'
import { SectionStudentTable } from '../features/classes/components/SectionDetail/SectionStudentTable'
import { SectionRollManager } from '../features/classes/components/SectionDetail/SectionRollManager'
import { SectionQuickActions } from '../features/classes/components/SectionDetail/SectionQuickActions'
import { SectionSummaryCards } from '../features/classes/components/SectionDetail/SectionSummaryCards'
import { SectionExamsTab } from '../features/classes/components/SectionDetail/SectionExamsTab'
import { SectionAttendanceTab } from '../features/classes/components/SectionDetail/SectionAttendanceTab'
import { SectionRoutineTab } from '../features/classes/components/SectionDetail/SectionRoutineTab'
import { SectionFeesTab } from '../features/classes/components/SectionDetail/SectionFeesTab'
import { SectionSubjectsTab } from '../features/classes/components/SectionDetail/SectionSubjectsTab'
import { EditSectionModal } from '../features/classes/components/modals/EditSectionModal'
import { TransferStudentModal } from '../features/classes/components/modals/TransferStudentModal'
import { SmartRollModal } from '../features/classes/components/modals/SmartRollModal'
import { PrintableRollSheetModal } from '../features/classes/components/modals/PrintableRollSheetModal'
import { useSectionDetail } from '../features/classes/useSectionDetail'
import type { SectionStudent } from '../features/classes/types'
import { classStore, groupStore } from '@/data/stores'

type SectionTab = 'STUDENTS' | 'EXAMS' | 'ATTENDANCE' | 'ROUTINE' | 'FEES' | 'SUBJECTS'

export function SectionDetail() {
  const { classId, sectionId, groupId } = useParams<{
    classId: string
    sectionId: string
    groupId?: string
  }>()

  const [activeTab, setActiveTab] = useState<SectionTab>('STUDENTS')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSmartRollOpen, setIsSmartRollOpen] = useState(false)
  const [isPrintRollOpen, setIsPrintRollOpen] = useState(false)
  const [transferTarget, setTransferTarget] = useState<SectionStudent | null>(null)

  const {
    section,
    students,
    availableSections,
    classExams,
    toggleRollFreeze,
    autoAssignRolls,
    swapStudentRolls,
    editSection,
    transferStudent,
  } = useSectionDetail(sectionId)

  const classData = classStore.getWhere(c => c.id === classId)[0] ?? null
  const groupData = groupId ? groupStore.getWhere(g => g.id === groupId)[0] ?? null : null

  if (!section || !classData) {
    return <div className="p-6 text-center text-zinc-600">Section not found</div>
  }

  // ── Breadcrumbs ─────────────────────────────────────────────────────────
  const breadcrumbs: { label: string; path?: string }[] = [
    { label: 'Classes', path: '/classes' },
    { label: classData.name, path: `/admin/classes/${classId}` },
  ]
  if (groupId && groupData) {
    breadcrumbs.push({
      label: `${groupData.name.charAt(0) + groupData.name.slice(1).toLowerCase()} Group`,
      path: `/admin/classes/${classId}/groups/${groupId}`,
    })
  }
  breadcrumbs.push({ label: `Section ${section.name}` })

  const fillPct = Math.round((section.totalStudents / section.capacity) * 100)

  return (
    <div className="space-y-5 flex flex-col min-h-screen pb-12">
      <BreadcrumbNav items={breadcrumbs} />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white shadow-xs border border-zinc-200 rounded-3xl p-6 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
              Section {section.name}
              {groupData ? (
                <span className="ml-2 text-base font-normal text-zinc-500">
                  ({groupData.name.charAt(0) + groupData.name.slice(1).toLowerCase()})
                </span>
              ) : null}
            </h1>

            {section.isRollFrozen ? (
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                Rolls Locked
              </span>
            ) : (
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                Rolls Editable
              </span>
            )}

            {section.status === 'INACTIVE' && (
              <span className="text-xs bg-zinc-100 text-zinc-600 border border-zinc-200 px-2.5 py-0.5 rounded-full font-semibold">
                Inactive
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            Class: <strong className="text-zinc-800">{section.className}</strong>
            {' · '}Class Teacher:{' '}
            <span className="text-zinc-800 font-semibold">
              {section.classTeacherName ?? 'Not Assigned'}
            </span>
            {' · '}Capacity:{' '}
            <span className={fillPct >= 90 ? 'text-rose-600 font-bold' : 'text-zinc-800 font-semibold'}>
              {section.totalStudents}/{section.capacity}
            </span>
            {' · '}Boys: <strong className="text-zinc-800">{section.maleCount}</strong> | Girls: <strong className="text-zinc-800">{section.femaleCount}</strong>
          </p>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsSmartRollOpen(true)}
            disabled={section.isRollFrozen}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles size={14} className="text-indigo-600" />
            <span>Manage Rolls</span>
          </button>

          <button
            onClick={() => setIsPrintRollOpen(true)}
            className="flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer size={14} className="text-zinc-600" />
            <span>Print Roll Sheet</span>
          </button>

          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Pencil size={14} className="text-amber-500" />
            <span>Edit Section</span>
          </button>
        </div>
      </div>

      {/* ── Section Command Tabs ─────────────────────────────────────────── */}
      <div className="border-b border-zinc-200 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('STUDENTS')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'STUDENTS'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Users size={15} />
            <span>Students & Rolls ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('EXAMS')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'EXAMS'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Trophy size={15} className="text-amber-500" />
            <span>Exams & Grade Serial</span>
          </button>

          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ATTENDANCE'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <CalendarDays size={15} className="text-emerald-500" />
            <span>Attendance & Regularity</span>
          </button>

          <button
            onClick={() => setActiveTab('ROUTINE')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ROUTINE'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Clock size={15} className="text-purple-500" />
            <span>Class Routine</span>
          </button>

          <button
            onClick={() => setActiveTab('FEES')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'FEES'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <CreditCard size={15} className="text-rose-500" />
            <span>Fees & Dues</span>
          </button>

          <button
            onClick={() => setActiveTab('SUBJECTS')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'SUBJECTS'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <BookOpen size={15} className="text-blue-500" />
            <span>Subjects & Faculty</span>
          </button>
        </div>
      </div>

      {/* ── Main Tab Content ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 flex-1 min-h-0">
        {/* Active Tab View */}
        <div className="lg:col-span-3 min-h-0">
          {activeTab === 'STUDENTS' && (
            <SectionStudentTable
              students={students}
              onTransfer={s => setTransferTarget(s)}
            />
          )}

          {activeTab === 'EXAMS' && (
            <SectionExamsTab
              students={students}
              classExams={classExams}
            />
          )}

          {activeTab === 'ATTENDANCE' && (
            <SectionAttendanceTab
              section={section}
              students={students}
            />
          )}

          {activeTab === 'ROUTINE' && (
            <SectionRoutineTab
              section={section}
            />
          )}

          {activeTab === 'FEES' && (
            <SectionFeesTab
              section={section}
              students={students}
            />
          )}

          {activeTab === 'SUBJECTS' && (
            <SectionSubjectsTab
              section={section}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 overflow-y-auto">
          <SectionSummaryCards students={students} />
          <SectionRollManager
            isFrozen={section.isRollFrozen}
            onToggleFreeze={toggleRollFreeze}
            onOpenSmartRoll={() => setIsSmartRollOpen(true)}
          />
          <SectionQuickActions />
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <SmartRollModal
        isOpen={isSmartRollOpen}
        onClose={() => setIsSmartRollOpen(false)}
        section={section}
        students={students}
        classExams={classExams}
        onAutoAssign={autoAssignRolls}
        onSwapRolls={swapStudentRolls}
      />

      <PrintableRollSheetModal
        isOpen={isPrintRollOpen}
        onClose={() => setIsPrintRollOpen(false)}
        section={section}
        students={students}
      />

      <EditSectionModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        section={section}
        onSave={data => {
          editSection(data)
          setIsEditOpen(false)
        }}
      />

      <TransferStudentModal
        isOpen={transferTarget !== null}
        onClose={() => setTransferTarget(null)}
        student={transferTarget}
        currentSection={section}
        availableSections={availableSections}
        onTransfer={(studentId, toSectionId) => {
          transferStudent(studentId, toSectionId)
          setTransferTarget(null)
        }}
      />
    </div>
  )
}
