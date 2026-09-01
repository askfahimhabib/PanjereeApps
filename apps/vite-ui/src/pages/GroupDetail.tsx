import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Plus,
  FlaskConical,
  Palette,
  Calculator,
  LayoutGrid,
  Users,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
import { BreadcrumbNav } from '../features/classes/components/shared/BreadcrumbNav'
import { SectionList } from '../features/classes/components/ClassDetailPage/SectionList'
import { SectionStudentTable } from '../features/classes/components/SectionDetail/SectionStudentTable'
import { AddSectionModal } from '../features/classes/components/modals/AddSectionModal'
import { TransferStudentModal } from '../features/classes/components/modals/TransferStudentModal'
import { useClassDetail } from '../features/classes/useClassDetail'
import { subjectStore } from '@/data/stores'
import type { SectionStudent } from '../features/classes/types'

const GROUP_THEME: Record<
  string,
  { label: string; labelBn: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  SCIENCE: {
    label: 'Science',
    labelBn: 'বিজ্ঞান বিভাগ',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <FlaskConical className="text-emerald-600" size={24} />,
  },
  ARTS: {
    label: 'Humanities / Arts',
    labelBn: 'মানবিক বিভাগ',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: <Palette className="text-purple-600" size={24} />,
  },
  COMMERCE: {
    label: 'Business Studies / Commerce',
    labelBn: 'ব্যবসায় শিক্ষা বিভাগ',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <Calculator className="text-amber-600" size={24} />,
  },
}

export function GroupDetail() {
  const { classId, groupId } = useParams<{ classId: string; groupId: string }>()
  const [activeTab, setActiveTab] = useState<'sections' | 'students' | 'subjects'>('sections')
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
  const [assignStudent, setAssignStudent] = useState<SectionStudent | null>(null)

  const {
    classData,
    groups,
    getGroupSections,
    addSection,
    deleteSection,
    getGroupStudents,
    assignStudentToSection,
  } = useClassDetail(classId)

  const groupData = groups.find(g => g.id === groupId) ?? null

  // Fetch subjects for this class & group
  const groupSubjects = useMemo(() => {
    if (!classId || !groupData) return []
    return subjectStore.getWhere(s => {
      if (s.classId !== classId) return false
      if (s.groupId === groupData.id) return true
      if (s.groupName && s.groupName.toUpperCase() === groupData.name.toUpperCase()) return true
      return false
    })
  }, [classId, groupData])

  if (!classData || !groupData) {
    return <div className="p-12 text-center text-zinc-500 font-bold">Group stream not found</div>
  }

  const groupSections = getGroupSections(groupId!)
  const groupStudents = getGroupStudents(groupId!)
  const theme = GROUP_THEME[groupData.name] ?? GROUP_THEME['SCIENCE']

  return (
    <div className="space-y-6 pb-12">
      <BreadcrumbNav
        items={[
          { label: 'Classes', path: '/classes' },
          { label: classData.name, path: `/admin/classes/${classId}` },
          { label: `${theme.label} Stream` },
        ]}
      />

      {/* ── 1. Master Group Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white shadow-xs border border-zinc-200 rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 ${theme.bg} border ${theme.border} rounded-2xl`}>
            {theme.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className={`text-2xl font-black tracking-tight ${theme.color}`}>
                {theme.label} Stream
              </h1>
              <span className="text-xs font-bold bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-200">
                {classData.name}
              </span>
              <span className="text-xs font-bold text-zinc-500">
                ({theme.labelBn})
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              Academic stream with <strong className="text-zinc-800">{groupData.totalStudents}</strong> students across{' '}
              <strong className="text-zinc-800">{groupSections.length}</strong> sections and{' '}
              <strong className="text-zinc-800">{groupSubjects.length}</strong> curriculum subjects
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddSectionOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-md shadow-indigo-500/20 cursor-pointer"
        >
          <Plus size={15} />
          <span>Add Section</span>
        </button>
      </div>

      {/* ── 2. Navigation Tabs (Sections / Students / Subjects) ────────────── */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-1">
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'sections'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <LayoutGrid size={15} />
          <span>Sections ({groupSections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <Users size={15} />
          <span>Students ({groupStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'subjects'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'
          }`}
        >
          <BookOpen size={15} />
          <span>Curriculum Subjects ({groupSubjects.length})</span>
        </button>
      </div>

      {/* ── 3. Tab Content ────────────────────────────────────────────────── */}

      {/* TAB 1: Sections */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          {groupSections.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center text-zinc-500">
              <LayoutGrid size={36} className="mx-auto mb-3 text-zinc-300" />
              <p className="font-bold text-zinc-800 text-sm">No sections created for this stream yet</p>
              <p className="text-xs text-zinc-400 mt-1">
                Click &ldquo;Add Section&rdquo; above to create Section A, Section B, etc.
              </p>
            </div>
          ) : (
            <SectionList sections={groupSections} onDelete={deleteSection} />
          )}
        </div>
      )}

      {/* TAB 2: Students */}
      {activeTab === 'students' && (
        <div>
          <SectionStudentTable
            students={groupStudents}
            onTransfer={student => setAssignStudent(student)}
          />
        </div>
      )}

      {/* TAB 3: Curriculum Subjects */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-zinc-900">
                {theme.label} Stream Specialized Subjects
              </h3>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Core and elective papers defined for {classData.name} ({theme.label})
              </p>
            </div>
            <Link
              to="/subjects"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Manage all subjects</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {groupSubjects.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                <BookOpen size={32} className="mx-auto mb-2 text-zinc-300" />
                <p className="font-bold text-zinc-800 text-sm">No specialized subjects listed</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Subjects can be assigned in the Curriculum Subjects module.
                </p>
              </div>
            ) : (
              groupSubjects.map(sub => (
                <div
                  key={sub.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4.5 hover:bg-zinc-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200 font-mono font-bold text-xs text-zinc-700 flex items-center justify-center shrink-0">
                      {sub.code || 'SUB'}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{sub.name}</p>
                      {sub.nameBn && (
                        <p className="text-xs text-zinc-500 font-medium">{sub.nameBn}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    {sub.paper && sub.paper !== 'NONE' && (
                      <span className="bg-zinc-100 text-zinc-700 font-bold px-2.5 py-1 rounded-lg border border-zinc-200">
                        {sub.paper} Paper
                      </span>
                    )}
                    <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg border border-indigo-200">
                      {sub.totalMarks || 100} Marks (Pass: {sub.passMarks || 33})
                    </span>
                    {sub.isOptional && (
                      <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-lg border border-amber-200">
                        Elective (৪র্থ বিষয়)
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── 4. Modals ─────────────────────────────────────────────────────── */}
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
