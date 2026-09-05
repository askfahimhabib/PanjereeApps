import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  BookOpen,
  Pencil,
  Trash2,
  GraduationCap,
  Sparkles,
  LayoutGrid,
  List,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useSubjects } from '../features/subjects/useSubjects'
import { SubjectModal } from '../features/subjects/components/SubjectModal'
import {
  PAPER_LABELS,
  type Subject,
  type ClassGroupType,
  type SubjectPaper,
} from '../features/subjects/types'
import { classStore, subjectStore } from '@/data/stores'
import { MOCK_SUBJECTS } from '@/data/mockData'
import { ScrollableTabs } from '@/components/ui/ScrollableTabs'

const GROUP_CONFIG: Record<
  ClassGroupType,
  { label: string; labelBn: string; bg: string; text: string; border: string; icon: string }
> = {
  SCIENCE: {
    label: 'Science',
    labelBn: 'বিজ্ঞান বিভাগ',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: '🔬',
  },
  COMMERCE: {
    label: 'Commerce',
    labelBn: 'ব্যবসায় শিক্ষা',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: '💼',
  },
  ARTS: {
    label: 'Humanities',
    labelBn: 'মানবিক বিভাগ',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: '📖',
  },
}

const PAPER_CONFIG: Record<
  SubjectPaper,
  { label: string; badge: string; border: string }
> = {
  FIRST: {
    label: '1st Paper (১ম পত্র)',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    border: 'border-l-4 border-l-emerald-500',
  },
  SECOND: {
    label: '2nd Paper (২য় পত্র)',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    border: 'border-l-4 border-l-teal-500',
  },
  NONE: {
    label: 'Single Paper',
    badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    border: 'border-l-4 border-l-indigo-500',
  },
}

export function Subjects() {
  const {
    filtered,
    filters,
    stats,
    isModalOpen,
    editingSubject,
    openAddModal,
    openEditModal,
    closeModal,
    saveSubject,
    deleteSubject,
    updateFilter,
  } = useSubjects()

  const [viewLayout, setViewLayout] = useState<'cards' | 'table'>('cards')
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL')
  const [targetClassForAdd, setTargetClassForAdd] = useState<string | undefined>(undefined)

  const classesList = useMemo(() => {
    return classStore.getAll().filter((c) => c.isActive !== false)
  }, [])

  // Collapsible state per class: initially expand classes that have subjects
  const [collapsedClasses, setCollapsedClasses] = useState<Record<string, boolean>>({})

  const toggleClassCollapse = (classId: string) => {
    setCollapsedClasses((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }))
  }

  const expandAll = () => setCollapsedClasses({})
  const collapseAll = () => {
    const all: Record<string, boolean> = {}
    classesList.forEach((c) => {
      all[c.id] = true
    })
    setCollapsedClasses(all)
  }

  // Filter by group if user selected a group chip
  const displaySubjects = useMemo(() => {
    return filtered.filter((s) => {
      if (selectedGroupFilter === 'ALL') return true
      if (selectedGroupFilter === 'COMPULSORY') return !s.groupId && !s.groupName
      return s.groupId === selectedGroupFilter || s.groupName === selectedGroupFilter
    })
  }, [filtered, selectedGroupFilter])

  // Group all displaySubjects by Class
  const classSections = useMemo(() => {
    const map = new Map<string, { classItem: typeof classesList[0]; subjects: Subject[] }>()

    classesList.forEach((c) => {
      map.set(c.id, { classItem: c, subjects: [] })
    })

    displaySubjects.forEach((s) => {
      if (map.has(s.classId)) {
        map.get(s.classId)!.subjects.push(s)
      }
    })

    // If specific class filter is selected (and not ALL), only return that class
    if (filters.classId !== 'ALL') {
      const single = map.get(filters.classId)
      return single ? [single] : []
    }

    // Otherwise return classes that have subjects (or all active classes)
    return Array.from(map.values()).filter((item) => item.subjects.length > 0)
  }, [classesList, displaySubjects, filters.classId])

  const handleOpenAddForClass = (classId?: string) => {
    setTargetClassForAdd(classId || (filters.classId !== 'ALL' ? filters.classId : 'cls-6'))
    openAddModal()
  }

  const handleResetToDefault = () => {
    if (
      confirm(
        'Are you sure you want to reset all subjects to the standard Bangladesh NCTB curriculum?'
      )
    ) {
      subjectStore.clear()
      subjectStore.seed(MOCK_SUBJECTS)
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-violet-500/25">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-zinc-900 tracking-tight">
                Curriculum & Subjects
              </h1>
              <p className="text-xs text-zinc-500 font-medium">
                Bangladesh NCTB Curriculum • Class-wise Collapsible Routine & Exam Subjects
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleResetToDefault}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200/80 rounded-xl transition-colors flex items-center gap-1.5"
            title="Reset to NCTB standard curriculum"
          >
            <RotateCcw size={14} className="text-zinc-500" />
            Reset NCTB Presets
          </button>

          <button
            onClick={() => handleOpenAddForClass()}
            className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-md shadow-violet-500/25 flex items-center gap-1.5"
          >
            <Plus size={15} />
            Add New Subject
          </button>
        </div>
      </div>

      {/* ── Stats Summary Banner ───────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-xl shrink-0">
            📚
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-900 leading-none">{stats.total}</p>
            <p className="text-xs font-semibold text-zinc-500 mt-1">Total Subjects</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl shrink-0">
            📄
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700 leading-none">{stats.withPapers}</p>
            <p className="text-xs font-semibold text-zinc-500 mt-1">1st & 2nd Papers</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0">
            🏫
          </div>
          <div>
            <p className="text-2xl font-black text-blue-700 leading-none">
              {classesList.length}
            </p>
            <p className="text-xs font-semibold text-zinc-500 mt-1">Classes Configured</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl shrink-0">
            ⭐
          </div>
          <div>
            <p className="text-2xl font-black text-amber-700 leading-none">{stats.optional}</p>
            <p className="text-xs font-semibold text-zinc-500 mt-1">Optional / 4th Subjects</p>
          </div>
        </div>
      </div>

      {/* ── Class Quick Switcher Bar (Pills) ───────────────────── */}
      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <GraduationCap size={14} className="text-violet-600" />
            Class Filter (ক্লাস নির্বাচন করুন)
          </span>
          <span className="text-xs text-zinc-400 font-medium">
            Showing {displaySubjects.length} subjects
          </span>
        </div>

        <ScrollableTabs className="w-full pb-1" trackClassName="gap-2">
          <button
            onClick={() => updateFilter('classId', 'ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              filters.classId === 'ALL'
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70'
            }`}
          >
            <Sparkles size={13} />
            All Classes ({stats.total})
          </button>

          {classesList.map((c) => {
            const isSelected = filters.classId === c.id
            return (
              <button
                key={c.id}
                onClick={() => updateFilter('classId', c.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25 font-bold'
                    : 'bg-zinc-100/90 text-zinc-700 hover:bg-zinc-200/70'
                }`}
              >
                <span>{c.name}</span>
                {c.hasGroups && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    Groups
                  </span>
                )}
              </button>
            )
          })}
        </ScrollableTabs>
      </div>

      {/* ── Search, Group Filter & Controls Bar ────────────────── */}
      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search by code (e.g. 101, 136) or subject name..."
            className="w-full pl-9.5 pr-4 py-2 text-xs font-medium border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
          />
        </div>

        {/* Group Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Streams' },
            { id: 'COMPULSORY', label: '📌 Compulsory' },
            { id: 'SCIENCE', label: '🔬 Science' },
            { id: 'COMMERCE', label: '💼 Commerce' },
            { id: 'ARTS', label: '📖 Humanities' },
          ].map((grp) => (
            <button
              key={grp.id}
              onClick={() => setSelectedGroupFilter(grp.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                selectedGroupFilter === grp.id
                  ? 'bg-zinc-900 text-white shadow-xs font-bold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
              }`}
            >
              {grp.label}
            </button>
          ))}
        </div>

        {/* Paper Filter Dropdown */}
        <select
          value={filters.paper}
          onChange={(e) => updateFilter('paper', e.target.value)}
          className="px-3 py-2 text-xs font-semibold border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        >
          <option value="ALL">All Papers</option>
          <option value="FIRST">1st Paper Only</option>
          <option value="SECOND">2nd Paper Only</option>
          <option value="NONE">Single / No Paper</option>
        </select>

        {/* Expand / Collapse All & View Layout Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/60">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-zinc-600 hover:bg-white hover:text-zinc-900 transition-colors flex items-center gap-1"
              title="Expand all class accordions"
            >
              <ChevronDown size={13} />
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-zinc-600 hover:bg-white hover:text-zinc-900 transition-colors flex items-center gap-1"
              title="Collapse all class accordions"
            >
              <ChevronUp size={13} />
              Collapse
            </button>
          </div>

          <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200/60">
            <button
              onClick={() => setViewLayout('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                viewLayout === 'cards'
                  ? 'bg-white text-violet-700 shadow-xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewLayout('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                viewLayout === 'table'
                  ? 'bg-white text-violet-700 shadow-xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Compact Table View"
            >
              <List size={15} />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Collapsible Class Accordion List ───────────────── */}
      {classSections.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
            <BookOpen size={28} />
          </div>
          <h3 className="font-bold text-zinc-800 text-base">No subjects match this filter</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search term, group filter, or add a new subject.
          </p>
          <button
            onClick={() => handleOpenAddForClass()}
            className="mt-4 px-4 py-2 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <Plus size={14} /> Add New Subject
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {classSections.map(({ classItem, subjects }) => {
            const isCollapsed = Boolean(collapsedClasses[classItem.id])

            // Subdivide subjects by group for Classes with groups
            const compulsory = subjects.filter((s) => !s.groupId && !s.groupName)
            const science = subjects.filter(
              (s) => s.groupId === 'SCIENCE' || s.groupName === 'SCIENCE' || s.groupId?.includes('sci')
            )
            const commerce = subjects.filter(
              (s) => s.groupId === 'COMMERCE' || s.groupName === 'COMMERCE' || s.groupId?.includes('com')
            )
            const arts = subjects.filter(
              (s) => s.groupId === 'ARTS' || s.groupName === 'ARTS' || s.groupId?.includes('art')
            )

            const hasGroupDivision = classItem.hasGroups && (science.length > 0 || commerce.length > 0 || arts.length > 0)

            return (
              <div
                key={classItem.id}
                className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* ── Accordion Header ───────────────────────── */}
                <div
                  onClick={() => toggleClassCollapse(classItem.id)}
                  className="flex items-center justify-between px-5 py-4 bg-zinc-50/70 hover:bg-zinc-100/70 cursor-pointer transition-colors select-none border-b border-zinc-200/60"
                >
                  <div className="flex items-center gap-3.5 flex-wrap">
                    <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm shadow-xs">
                      🏫
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-zinc-900">
                          {classItem.name}
                        </h3>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
                          {subjects.length} Subjects
                        </span>
                      </div>

                      {/* Group Pills preview in header */}
                      {hasGroupDivision ? (
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {compulsory.length > 0 && (
                            <span className="text-[10px] font-semibold text-zinc-600 bg-white px-2 py-0.5 rounded-md border border-zinc-200">
                              📌 {compulsory.length} Compulsory
                            </span>
                          )}
                          {science.length > 0 && (
                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                              🔬 {science.length} Science
                            </span>
                          )}
                          {commerce.length > 0 && (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              💼 {commerce.length} Commerce
                            </span>
                          )}
                          {arts.length > 0 && (
                            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                              📖 {arts.length} Arts
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          General Junior Secondary Curriculum
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Add subject specifically for this class */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenAddForClass(classItem.id)
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Plus size={13} />
                      <span className="hidden sm:inline">Add to</span> {classItem.name}
                    </button>

                    {/* Chevron Icon */}
                    <div className="w-8 h-8 rounded-lg bg-zinc-200/60 flex items-center justify-center text-zinc-600 transition-transform duration-200">
                      {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </div>
                  </div>
                </div>

                {/* ── Accordion Body ─────────────────────────── */}
                {!isCollapsed && (
                  <div className="p-5 space-y-6 bg-white animate-in slide-in-from-top-2 duration-200">
                    {hasGroupDivision ? (
                      /* Grouped Breakdown for Classes 9–12 */
                      <div className="space-y-6">
                        {compulsory.length > 0 && (
                          <SubjectSectionBlock
                            title="📌 Compulsory / Common Subjects (আবশ্যিক বিষয়সমূহ)"
                            description="Mandatory for all students in this class"
                            badgeColor="bg-zinc-100 text-zinc-700 border-zinc-200"
                            count={compulsory.length}
                            subjects={compulsory}
                            viewLayout={viewLayout}
                            onEdit={openEditModal}
                            onDelete={deleteSubject}
                          />
                        )}

                        {science.length > 0 && (
                          <SubjectSectionBlock
                            title="🔬 Science Group (বিজ্ঞান বিভাগ)"
                            description="Physics, Chemistry, Biology & Higher Math"
                            badgeColor="bg-blue-50 text-blue-700 border-blue-200"
                            count={science.length}
                            subjects={science}
                            viewLayout={viewLayout}
                            onEdit={openEditModal}
                            onDelete={deleteSubject}
                          />
                        )}

                        {commerce.length > 0 && (
                          <SubjectSectionBlock
                            title="💼 Business Studies / Commerce (ব্যবসায় শিক্ষা বিভাগ)"
                            description="Accounting, Business Entrepreneurship & Finance"
                            badgeColor="bg-amber-50 text-amber-700 border-amber-200"
                            count={commerce.length}
                            subjects={commerce}
                            viewLayout={viewLayout}
                            onEdit={openEditModal}
                            onDelete={deleteSubject}
                          />
                        )}

                        {arts.length > 0 && (
                          <SubjectSectionBlock
                            title="📖 Humanities / Arts (মানবিক বিভাগ)"
                            description="History, Geography, Civics & Economics"
                            badgeColor="bg-purple-50 text-purple-700 border-purple-200"
                            count={arts.length}
                            subjects={arts}
                            viewLayout={viewLayout}
                            onEdit={openEditModal}
                            onDelete={deleteSubject}
                          />
                        )}
                      </div>
                    ) : viewLayout === 'cards' ? (
                      /* Card Grid for Class 6–8 */
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {subjects.map((s) => (
                          <SubjectCard
                            key={s.id}
                            subject={s}
                            onEdit={openEditModal}
                            onDelete={deleteSubject}
                          />
                        ))}
                      </div>
                    ) : (
                      /* Table View for Class 6–8 */
                      <>
                        <div className="block sm:hidden space-y-2.5">
                          {subjects.map((s) => (
                            <SubjectCard
                              key={s.id}
                              subject={s}
                              onEdit={openEditModal}
                              onDelete={deleteSubject}
                            />
                          ))}
                        </div>
                        <div className="hidden sm:block border border-zinc-200/80 rounded-xl overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-bold uppercase tracking-wider">
                              <tr>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Subject Name</th>
                                <th className="px-4 py-3">Group</th>
                                <th className="px-4 py-3">Paper</th>
                                <th className="px-4 py-3">Marks</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                              {subjects.map((s) => (
                                <SubjectTableRow
                                  key={s.id}
                                  subject={s}
                                  onEdit={openEditModal}
                                  onDelete={deleteSubject}
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ───────────────────────────────────── */}
      <SubjectModal
        isOpen={isModalOpen}
        editing={editingSubject}
        defaultClassId={targetClassForAdd}
        onClose={() => {
          closeModal()
          setTargetClassForAdd(undefined)
        }}
        onSave={saveSubject}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  SECTION BLOCK (FOR CATEGORIZED SSC/HSC GROUPS)
// ─────────────────────────────────────────────────────────────
function SubjectSectionBlock({
  title,
  description,
  badgeColor,
  count,
  subjects,
  viewLayout,
  onEdit,
  onDelete,
}: {
  title: string
  description: string
  badgeColor: string
  count: number
  subjects: Subject[]
  viewLayout: 'cards' | 'table'
  onEdit: (s: Subject) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between px-1">
        <div>
          <h4 className="font-bold text-sm text-zinc-900">{title}</h4>
          <p className="text-[11px] text-zinc-500">{description}</p>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}
        >
          {count} Subjects
        </span>
      </div>

      {viewLayout === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <>
          <div className="block sm:hidden space-y-2.5">
            {subjects.map((s) => (
              <SubjectCard key={s.id} subject={s} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
          <div className="hidden sm:block border border-zinc-200/80 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                {subjects.map((s) => (
                  <SubjectTableRow
                    key={s.id}
                    subject={s}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  MODERN SUBJECT CARD
// ─────────────────────────────────────────────────────────────
function SubjectCard({
  subject: s,
  onEdit,
  onDelete,
  showClass = false,
}: {
  subject: Subject
  onEdit: (s: Subject) => void
  onDelete: (id: string) => void
  showClass?: boolean
}) {
  const paperConf = PAPER_CONFIG[s.paper] ?? PAPER_CONFIG.NONE
  const groupConf = s.groupName ? GROUP_CONFIG[s.groupName as ClassGroupType] : null

  return (
    <div
      className={`bg-white rounded-2xl border border-zinc-200/80 p-4.5 shadow-xs hover:shadow-md hover:border-violet-300/80 transition-all flex flex-col justify-between gap-3 group relative overflow-hidden ${paperConf.border}`}
    >
      {/* Top row: Code + Badges + Actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Subject Board Code */}
          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-zinc-900 text-white tracking-wider">
            {s.code}
          </span>

          {/* Paper Badge */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${paperConf.badge}`}
          >
            {paperConf.label}
          </span>

          {/* Optional Tag */}
          {s.isOptional && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              ⭐ Optional
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(s)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
            title="Edit Subject"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(s.id)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete Subject"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Middle row: Subject Title EN & BN */}
      <div>
        <h4 className="font-bold text-zinc-900 text-sm leading-snug group-hover:text-violet-700 transition-colors">
          {s.name}
        </h4>
        {s.nameBn && (
          <p className="text-xs font-medium text-zinc-500 mt-0.5 font-sans">
            {s.nameBn}
          </p>
        )}
      </div>

      {/* Bottom row: Class / Group / Marks */}
      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-zinc-100 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {showClass && (
            <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md">
              {s.className}
            </span>
          )}

          {groupConf && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${groupConf.bg} ${groupConf.text} ${groupConf.border}`}
            >
              {groupConf.icon} {groupConf.label}
            </span>
          )}
        </div>

        {/* Marks Capsule */}
        <div className="text-[11px] font-semibold text-zinc-600 bg-zinc-50 border border-zinc-200/80 px-2 py-0.5 rounded-md shrink-0">
          <span className="font-bold text-zinc-900">{s.totalMarks}m</span>{' '}
          <span className="text-zinc-400 font-normal">| Pass: {s.passMarks}</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  STRUCTURED TABLE ROW
// ─────────────────────────────────────────────────────────────
function SubjectTableRow({
  subject: s,
  onEdit,
  onDelete,
  showClass = false,
}: {
  subject: Subject
  onEdit: (s: Subject) => void
  onDelete: (id: string) => void
  showClass?: boolean
}) {
  const paperConf = PAPER_CONFIG[s.paper] ?? PAPER_CONFIG.NONE
  const groupConf = s.groupName ? GROUP_CONFIG[s.groupName as ClassGroupType] : null

  return (
    <tr className="hover:bg-zinc-50/80 transition-colors">
      <td className="px-4 py-3 font-mono font-bold text-zinc-900">
        <span className="bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 text-[11px]">
          {s.code}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="font-bold text-zinc-900 text-xs">{s.name}</div>
        {s.nameBn && <div className="text-[11px] text-zinc-500">{s.nameBn}</div>}
      </td>

      {showClass && (
        <td className="px-4 py-3 text-xs font-semibold text-zinc-600">{s.className}</td>
      )}

      <td className="px-4 py-3">
        {groupConf ? (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${groupConf.bg} ${groupConf.text} ${groupConf.border}`}
          >
            {groupConf.icon} {groupConf.label}
          </span>
        ) : (
          <span className="text-[10px] text-zinc-400 font-medium">📌 Compulsory</span>
        )}
      </td>

      <td className="px-4 py-3">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${paperConf.badge}`}
        >
          {PAPER_LABELS[s.paper]}
        </span>
      </td>

      <td className="px-4 py-3 text-xs">
        <span className="font-bold text-zinc-900">{s.totalMarks}</span>
        <span className="text-zinc-400 font-normal"> / {s.passMarks} pass</span>
        {s.isOptional && (
          <span className="ml-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-sm border border-amber-200">
            Opt
          </span>
        )}
      </td>

      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(s)}
            className="p-1 rounded-md text-zinc-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(s.id)}
            className="p-1 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}
