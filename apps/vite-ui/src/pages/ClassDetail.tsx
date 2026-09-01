import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Settings, Calculator, Plus, Printer } from 'lucide-react'
import { BreadcrumbNav } from '../features/classes/components/shared/BreadcrumbNav'
import { SectionList } from '../features/classes/components/ClassDetailPage/SectionList'
import { GroupList } from '../features/classes/components/ClassDetailPage/GroupList'
import { SectionStudentTable } from '../features/classes/components/SectionDetail/SectionStudentTable'
import { AddSectionModal } from '../features/classes/components/modals/AddSectionModal'
import { SetFeeModal } from '../features/classes/components/modals/SetFeeModal'
import { ClassSettingsModal } from '../features/classes/components/modals/ClassSettingsModal'
import { TransferStudentModal } from '../features/classes/components/modals/TransferStudentModal'
import { PrintableRollSheetModal } from '../features/classes/components/modals/PrintableRollSheetModal'
import { useClassDetail } from '../features/classes/useClassDetail'
import type { SectionStudent, Section } from '../features/classes/types'

export function ClassDetail() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()

  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
  const [isSetFeeOpen, setIsSetFeeOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [assignStudent, setAssignStudent] = useState<SectionStudent | null>(null)

  const {
    classData,
    classSections,
    groups,
    addSection,
    deleteSection,
    updateFee,
    editClass,
    deleteClass,
    classStudents,
    assignStudentToSection,
  } = useClassDetail(classId)

  if (!classData) {
    return <div className="p-6 text-center text-zinc-600">Class not found</div>
  }

  // Virtual section representing whole class for printing
  const classVirtualSection: Section = {
    id: classData.id,
    classId: classData.id,
    className: classData.name,
    name: 'All Sections',
    capacity: classData.totalStudents || 100,
    totalStudents: classData.totalStudents,
    maleCount: classStudents.filter(s => s.gender === 'MALE').length,
    femaleCount: classStudents.filter(s => s.gender === 'FEMALE').length,
    status: 'ACTIVE',
    isRollFrozen: false,
    shift: classData.shift,
    academicYear: classData.academicYear,
  }

  return (
    <div className="space-y-5">
      <BreadcrumbNav
        items={[
          { label: 'Classes', path: '/classes' },
          { label: classData.name },
        ]}
      />

      {/* ── Class Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white shadow-xs border border-zinc-200 rounded-3xl p-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{classData.name}</h1>
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {classData.shift} Shift
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Session: <strong className="text-zinc-800">{classData.academicYear}</strong> &nbsp;·&nbsp;
            <span className="text-zinc-800 font-bold">{classData.totalStudents}</span> Students &nbsp;·&nbsp;
            <span className="text-zinc-800 font-bold">{classData.totalSections}</span> Sections
            {classData.feeMonthly && (
              <> &nbsp;·&nbsp; Fee: <span className="text-amber-600 font-bold">৳{classData.feeMonthly}/mo</span></>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer size={14} className="text-zinc-600" />
            Print Class Sheet
          </button>
          <button
            onClick={() => setIsSetFeeOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Calculator size={14} className="text-amber-500" />
            Fee Structure
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Settings size={14} />
            Settings
          </button>
        </div>
      </div>

      {/* ── Sections / Groups ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-zinc-900">
            {classData.hasGroups ? 'Groups' : 'Sections'}
            <span className="ml-2 text-xs text-zinc-500 font-normal">
              ({classData.hasGroups ? groups.length : classSections.length})
            </span>
          </h2>
          {!classData.hasGroups && (
            <button
              onClick={() => setIsAddSectionOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <Plus size={15} />
              Add Section
            </button>
          )}
        </div>

        {classData.hasGroups ? (
          <GroupList groups={groups} classId={classData.id} />
        ) : (
          <>
            {classSections.length > 0 && (
              <div className="mb-6">
                <SectionList
                  sections={classSections}
                  onDelete={deleteSection}
                />
              </div>
            )}
            
            {/* Unassigned / All Students */}
            {(() => {
              const unassignedStudents = classStudents.filter(student => 
                !classSections.some(sec => sec.id === student.sectionId || sec.name === student.sectionName)
              );

              if (classSections.length === 0 || unassignedStudents.length > 0) {
                return (
                  <div>
                    {classSections.length > 0 && (
                      <h2 className="text-base font-bold text-zinc-900 mb-4">
                        Unassigned Students
                        <span className="ml-2 text-xs text-zinc-500 font-normal">
                          ({unassignedStudents.length})
                        </span>
                      </h2>
                    )}
                    <SectionStudentTable
                      students={classSections.length > 0 ? unassignedStudents : classStudents}
                      onTransfer={student => setAssignStudent(student)}
                    />
                  </div>
                )
              }
              return null
            })()}
          </>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <PrintableRollSheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        section={classVirtualSection}
        students={classStudents}
      />

      <AddSectionModal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        classId={classData.id}
        className={classData.name}
        onAdd={addSection}
      />

      <SetFeeModal
        isOpen={isSetFeeOpen}
        onClose={() => setIsSetFeeOpen(false)}
        classData={classData}
        onSave={updateFee}
      />

      <ClassSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        classData={classData}
        onSave={editClass}
        onDelete={() => {
          deleteClass()
          navigate('/admin/classes')
        }}
      />

      <TransferStudentModal
        isOpen={!!assignStudent}
        onClose={() => setAssignStudent(null)}
        student={assignStudent}
        availableSections={classSections}
        onTransfer={(studentId, toSectionId) => {
          assignStudentToSection(studentId, toSectionId)
          setAssignStudent(null)
        }}
      />
    </div>
  )
}
