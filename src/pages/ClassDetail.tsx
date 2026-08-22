import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Settings, Calculator, Download, Plus } from 'lucide-react'
import { BreadcrumbNav } from '../features/classes/components/shared/BreadcrumbNav'
import { SectionList } from '../features/classes/components/ClassDetailPage/SectionList'
import { GroupList } from '../features/classes/components/ClassDetailPage/GroupList'
import { SectionStudentTable } from '../features/classes/components/SectionDetail/SectionStudentTable'
import { AddSectionModal } from '../features/classes/components/modals/AddSectionModal'
import { SetFeeModal } from '../features/classes/components/modals/SetFeeModal'
import { ClassSettingsModal } from '../features/classes/components/modals/ClassSettingsModal'
import { TransferStudentModal } from '../features/classes/components/modals/TransferStudentModal'
import { useClassDetail } from '../features/classes/useClassDetail'
import type { SectionStudent } from '../features/classes/types'

export function ClassDetail() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()

  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
  const [isSetFeeOpen, setIsSetFeeOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
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
    return <div className="p-6 text-center text-slate-400">Class not found</div>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{classData.name}</h1>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-lg text-xs font-semibold">
              {classData.shift} Shift
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Session: {classData.academicYear} &nbsp;·&nbsp;
            <span className="text-slate-300">{classData.totalStudents}</span> Students &nbsp;·&nbsp;
            <span className="text-slate-300">{classData.totalSections}</span> Sections
            {classData.feeMonthly && (
              <> &nbsp;·&nbsp; Fee: <span className="text-amber-400 font-medium">৳{classData.feeMonthly}/mo</span></>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
            <Download size={15} />
            Export List
          </button>
          <button
            onClick={() => setIsSetFeeOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Calculator size={15} className="text-amber-400" />
            Fee Structure
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Settings size={15} />
            Settings
          </button>
        </div>
      </div>

      {/* ── Sections / Groups ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            {classData.hasGroups ? 'Groups' : 'Sections'}
            <span className="ml-2 text-sm text-slate-500 font-normal">
              ({classData.hasGroups ? groups.length : classSections.length})
            </span>
          </h2>
          {!classData.hasGroups && (
            <button
              onClick={() => setIsAddSectionOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-900/30"
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
                      <h2 className="text-lg font-semibold text-slate-100 mb-4">
                        Unassigned Students
                        <span className="ml-2 text-sm text-slate-500 font-normal">
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
