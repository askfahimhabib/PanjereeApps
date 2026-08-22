import { UserPlus } from 'lucide-react'
import { useStudents }          from '../features/students/useStudents'
import { StatsCards }           from '../features/students/components/StatsCards'
import { StudentFilters }       from '../features/students/components/StudentFilters'
import { StudentTable }         from '../features/students/components/StudentTable'
import { StudentDetailDrawer }  from '../features/students/components/StudentDetailDrawer'
import { AddStudentModal }      from '../features/students/components/AddStudentModal'
import { PromoteStudentsModal } from '../features/students/components/PromoteStudentsModal'
import { useState } from 'react'

export function Students() {
  const {
    stats, filteredStudents, paginatedStudents,
    filters, updateFilter, resetFilters,
    currentPage, setCurrentPage, totalPages,
    selectedStudent, isDrawerOpen, openDrawer, closeDrawer,
    isModalOpen, openModal, openEditModal, closeModal,
    editingStudentId,
    formData, updateFormData, currentStep, nextStep, prevStep, submitStudent,
    deleteStudent, promoteStudents, students,
  } = useStudents()

  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false)

  return (
    <>
      <div className="space-y-5">
        {/* ── Page Header ──────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Students</h1>
            <p className="text-sm text-slate-400 mt-1">Manage student records, enrollment, and profiles</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPromoteModalOpen(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Promote
            </button>
            <button
              id="add-student-btn"
              onClick={openModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-900/30"
            >
              <UserPlus size={17} />
              Add Student
            </button>
          </div>
        </div>

        {/* ── Stats Cards ───────────────────────────────── */}
        <StatsCards {...stats} />

        {/* ── Filter Bar ───────────────────────────────── */}
        <StudentFilters
          filters={filters}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
          totalResults={filteredStudents.length}
        />

        {/* ── Table ──────────────────────────────────── */}
        <StudentTable
          students={paginatedStudents}
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={filteredStudents.length}
          onPageChange={setCurrentPage}
          onView={openDrawer}
          onDelete={deleteStudent}
        />
      </div>

      {/* ── Detail Drawer ─────────────────────────────── */}
      <StudentDetailDrawer
        student={selectedStudent}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onEdit={openEditModal}
        onDelete={deleteStudent}
      />

      <AddStudentModal
        isOpen={isModalOpen}
        isEdit={!!editingStudentId}
        onClose={closeModal}
        currentStep={currentStep}
        formData={formData}
        onChange={updateFormData}
        onNext={nextStep}
        onPrev={prevStep}
        onSubmit={submitStudent}
      />

      {/* ── Promote Students Modal ──────────────────────── */}
      <PromoteStudentsModal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        students={students}
        onPromote={promoteStudents}
      />
    </>
  )
}
