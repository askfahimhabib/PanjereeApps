import { UserPlus } from 'lucide-react'
import { useTeachers } from '../features/teachers/useTeachers'
import { StatsCards }           from '../features/teachers/components/StatsCards'
import { TeacherFiltersBar }    from '../features/teachers/components/TeacherFilters'
import { TeacherTable }         from '../features/teachers/components/TeacherTable'
import { TeacherDetailDrawer }  from '../features/teachers/components/TeacherDetailDrawer'
import { AddTeacherModal }      from '../features/teachers/components/AddTeacherModal'

export function Teachers() {
  const {
    filteredTeachers, paginatedTeachers, stats,
    filters, updateFilter, resetFilters,
    currentPage, setCurrentPage, totalPages,
    selectedTeacher, isDrawerOpen, openDrawer, closeDrawer,
    isModalOpen, openModal, openEditModal, closeModal,
    editingTeacherId, formData, updateFormData,
    currentStep, nextStep, prevStep, TOTAL_STEPS,
    submitTeacher, deleteTeacher,
  } = useTeachers()

  return (
    <div className="space-y-5">
      {/* ── Page Header ────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Teachers</h1>
          <p className="text-sm text-slate-400 mt-1">Manage teaching staff profiles and assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-900/30 shrink-0"
          >
            <UserPlus size={17} />
            Add Teacher
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────── */}
      <StatsCards stats={stats} />

      {/* ── Filters ────────────────────────────────────── */}
      <TeacherFiltersBar
        filters={filters}
        onUpdate={updateFilter}
        onReset={resetFilters}
        total={stats.total}
        filtered={filteredTeachers.length}
      />

      {/* ── Table ──────────────────────────────────────── */}
      <TeacherTable
        teachers={paginatedTeachers}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onView={openDrawer}
        onEdit={openEditModal}
        onDelete={deleteTeacher}
      />

      {/* ── Detail Drawer ───────────────────────────────── */}
      <TeacherDetailDrawer
        teacher={selectedTeacher}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onEdit={openEditModal}
      />

      {/* ── Add / Edit Modal ───────────────────────────── */}
      <AddTeacherModal
        isOpen={isModalOpen}
        isEdit={!!editingTeacherId}
        onClose={closeModal}
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        formData={formData}
        onChange={updateFormData}
        onNext={nextStep}
        onPrev={prevStep}
        onSubmit={submitTeacher}
      />
    </div>
  )
}
