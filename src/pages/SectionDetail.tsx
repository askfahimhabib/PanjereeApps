import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, Pencil } from 'lucide-react'
import { BreadcrumbNav } from '../features/classes/components/shared/BreadcrumbNav'
import { SectionStudentTable } from '../features/classes/components/SectionDetail/SectionStudentTable'
import { SectionRollManager } from '../features/classes/components/SectionDetail/SectionRollManager'
import { SectionQuickActions } from '../features/classes/components/SectionDetail/SectionQuickActions'
import { SectionSummaryCards } from '../features/classes/components/SectionDetail/SectionSummaryCards'
import { EditSectionModal } from '../features/classes/components/modals/EditSectionModal'
import { TransferStudentModal } from '../features/classes/components/modals/TransferStudentModal'
import { useSectionDetail } from '../features/classes/useSectionDetail'
import type { SectionStudent } from '../features/classes/types'
import { mockClasses, mockGroups } from '../features/classes/mockData'

export function SectionDetail() {
  const { classId, sectionId, groupId } = useParams<{
    classId: string
    sectionId: string
    groupId?: string
  }>()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [transferTarget, setTransferTarget] = useState<SectionStudent | null>(null)

  const { section, students, availableSections, toggleRollFreeze, autoAssignRolls, editSection, transferStudent } =
    useSectionDetail(sectionId)

  const classData = mockClasses.find(c => c.id === classId) ?? null
  const groupData = groupId ? mockGroups.find(g => g.id === groupId) : null

  if (!section || !classData) {
    return <div className="p-6 text-center text-slate-400">Section not found</div>
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
    <div className="space-y-5 h-[calc(100vh-4rem)] flex flex-col">
      <BreadcrumbNav items={breadcrumbs} />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Section {section.name}
              {groupData ? (
                <span className="ml-2 text-base font-normal text-slate-400">
                  ({groupData.name.charAt(0) + groupData.name.slice(1).toLowerCase()})
                </span>
              ) : null}
            </h1>
            {section.isRollFrozen && (
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Rolls Frozen
              </span>
            )}
            {section.status === 'INACTIVE' && (
              <span className="text-xs bg-slate-600/50 text-slate-400 border border-slate-600/50 px-2 py-0.5 rounded-full">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">
            Class Teacher:{' '}
            <span className="text-slate-300 font-medium">
              {section.classTeacherName ?? 'Not Assigned'}
            </span>
            {' · '}Capacity:{' '}
            <span className={fillPct >= 90 ? 'text-red-400 font-medium' : 'text-slate-300'}>
              {section.totalStudents}/{section.capacity}
            </span>
            {' · '}Boys: {section.maleCount} | Girls: {section.femaleCount}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
            <Download size={15} />
            Export Roll Sheet
          </button>
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-2 bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Pencil size={15} className="text-amber-400" />
            Edit Section
          </button>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 flex-1 min-h-0">
        {/* Student Table */}
        <div className="lg:col-span-3 min-h-0">
          <SectionStudentTable
            students={students}
            onTransfer={s => setTransferTarget(s)}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4 overflow-y-auto">
          <SectionSummaryCards students={students} />
          <SectionRollManager
            isFrozen={section.isRollFrozen}
            onToggleFreeze={toggleRollFreeze}
            onAutoAssign={autoAssignRolls}
          />
          <SectionQuickActions />
        </div>
      </div>

      {/* ── Edit Modal ───────────────────────────────────────────────────── */}
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
