import { GraduationCap } from 'lucide-react'
import { useStudents } from '../features/students/useStudents'
import { StudentFilters } from '../features/students/components/StudentFilters'
import { StudentTable } from '../features/students/components/StudentTable'
import { StudentDetailDrawer } from '../features/students/components/StudentDetailDrawer'
import { AddStudentModal } from '../features/students/components/AddStudentModal'

export function Alumni() {
  const {
    filteredStudents, paginatedStudents,
    filters, updateFilter, resetFilters,
    currentPage, setCurrentPage, totalPages,
    selectedStudent, isDrawerOpen, openDrawer, closeDrawer,
    isModalOpen, openEditModal, closeModal,
    editingStudentId,
    formData, updateFormData, currentStep, nextStep, prevStep, submitStudent,
    deleteStudent,
  } = useStudents(true) // true for alumni mode

  return (
    <>
      <div className="space-y-5">
        {/* ── Page Header ──────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Alumni & Dropouts</h1>
            <p className="text-sm text-slate-400 mt-1">Manage passed out, suspended, and departed students</p>
          </div>
          <button
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-purple-900/30"
          >
            <GraduationCap size={17} />
            Generate Certificates
          </button>
        </div>

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

      {/* ── Add/Edit Modal (for edits only in Alumni mode) */}
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
    </>
  )
}
