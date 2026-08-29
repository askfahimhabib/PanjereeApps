import { UserPlus } from 'lucide-react'
import { useStudents }          from '../features/students/useStudents'
import { StatsCards }           from '../features/students/components/StatsCards'
import { StudentFilters }       from '../features/students/components/StudentFilters'
import { StudentTable }         from '../features/students/components/StudentTable'
import { StudentDetailDrawer }  from '../features/students/components/StudentDetailDrawer'
import { AddStudentModal }      from '../features/students/components/AddStudentModal'
import { PromoteStudentsModal } from '../features/students/components/PromoteStudentsModal'
import { CertificateModal }     from '../features/certificates/components/CertificateModal'
import type { Student }         from '../features/students/types'
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
  const [isCertModalOpen, setIsCertModalOpen] = useState(false)
  const [certStudent, setCertStudent] = useState<Student | null>(null)

  const handleOpenCertificateModal = (student?: Student | null) => {
    setCertStudent(student || filteredStudents[0] || null)
    setIsCertModalOpen(true)
  }

  return (
    <>
      <div className="space-y-5">
        {/* ── Page Header ──────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Students</h1>
            <p className="text-sm text-zinc-600 mt-1">Manage student records, enrollment, and profiles</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPromoteModalOpen(true)}
              className="flex items-center gap-2 bg-zinc-50 hover:bg-zinc-50 text-zinc-800 border border-zinc-100 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
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
          onCertificate={(student) => handleOpenCertificateModal(student)}
        />
      </div>

      {/* ── Detail Drawer ─────────────────────────────── */}
      <StudentDetailDrawer
        student={selectedStudent}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onEdit={openEditModal}
        onDelete={deleteStudent}
        onCertificate={(student) => handleOpenCertificateModal(student)}
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

      {/* ── Certificate Generator Modal ───────────────── */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        initialStudent={certStudent}
      />
    </>
  )
}
