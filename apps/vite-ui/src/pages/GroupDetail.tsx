import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { BreadcrumbNav } from '../features/classes/components/shared/BreadcrumbNav'
import { SectionList } from '../features/classes/components/ClassDetailPage/SectionList'
import { SectionStudentTable } from '../features/classes/components/SectionDetail/SectionStudentTable'
import { AddSectionModal } from '../features/classes/components/modals/AddSectionModal'
import { TransferStudentModal } from '../features/classes/components/modals/TransferStudentModal'
import { useClassDetail } from '../features/classes/useClassDetail'
import type { SectionStudent } from '../features/classes/types'

const GROUP_THEME: Record<string, { label: string; color: string; border: string }> = {
  SCIENCE:  { label: 'Science',  color: 'text-emerald-400', border: 'border-emerald-500/20' },
  ARTS:     { label: 'Arts',     color: 'text-purple-400',  border: 'border-purple-500/20'  },
  COMMERCE: { label: 'Commerce', color: 'text-amber-400',   border: 'border-amber-500/20'   },
}

export function GroupDetail() {
  const { classId, groupId } = useParams<{ classId: string; groupId: string }>()
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
  const [assignStudent, setAssignStudent] = useState<SectionStudent | null>(null)

  const { classData, groups, getGroupSections, addSection, deleteSection, getGroupStudents, assignStudentToSection } =
    useClassDetail(classId)

  const groupData = groups.find(g => g.id === groupId) ?? null

  if (!classData || !groupData) {
    return <div className="p-6 text-center text-zinc-600">Group not found</div>
  }

  const groupSections = getGroupSections(groupId!)
  const groupStudents = getGroupStudents(groupId!)
  const theme = GROUP_THEME[groupData.name] ?? GROUP_THEME['SCIENCE']

  return (
    <div className="space-y-5">
      <BreadcrumbNav
        items={[
          { label: 'Classes', path: '/classes' },
          { label: classData.name, path: `/admin/classes/${classId}` },
          { label: `${theme.label} Group` },
        ]}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-5">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${theme.color} mb-1`}>
            {theme.label} Group
          </h1>
          <p className="text-sm text-zinc-600">
            {classData.name} &nbsp;·&nbsp;
            <span className="text-zinc-800">{groupData.totalStudents}</span> Students &nbsp;·&nbsp;
            <span className="text-zinc-800">{groupSections.length}</span> Sections
          </p>
        </div>

        <button
          onClick={() => setIsAddSectionOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-900/30"
        >
          <Plus size={15} />
          Add Section
        </button>
      </div>

      {/* ── Sections ───────────────────────────────────────────────────────── */}
      {groupSections.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Sections
            <span className="ml-2 text-sm text-zinc-600 font-normal">
              ({groupSections.length})
            </span>
          </h2>
          <SectionList
            sections={groupSections}
            onDelete={deleteSection}
          />
        </div>
      )}

      {/* ── Unassigned / All Students ──────────────────────────────────────── */}
      {(() => {
        // Find students who are NOT in any of the existing groupSections
        const unassignedStudents = groupStudents.filter(student => 
          !groupSections.some(sec => sec.id === student.sectionId || sec.name === student.sectionName)
        );

        if (groupSections.length === 0 || unassignedStudents.length > 0) {
          return (
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">
                {groupSections.length > 0 ? 'Unassigned Students' : 'Students'}
                <span className="ml-2 text-sm text-zinc-600 font-normal">
                  ({groupSections.length > 0 ? unassignedStudents.length : groupStudents.length})
                </span>
              </h2>
              <SectionStudentTable
                students={groupSections.length > 0 ? unassignedStudents : groupStudents}
                onTransfer={student => setAssignStudent(student)}
              />
            </div>
          )
        }
        return null
      })()}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <AddSectionModal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        classId={classData.id}
        className={classData.name}
        groupId={groupData.id}
        groupName={groupData.name}
        onAdd={addSection}
      />

      <TransferStudentModal
        isOpen={!!assignStudent}
        onClose={() => setAssignStudent(null)}
        student={assignStudent}
        availableSections={groupSections}
        onTransfer={(studentId, toSectionId) => {
          assignStudentToSection(studentId, toSectionId)
          setAssignStudent(null)
        }}
      />
    </div>
  )
}
