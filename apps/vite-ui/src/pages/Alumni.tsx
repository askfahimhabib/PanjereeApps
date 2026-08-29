import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { useStudents } from '../features/students/useStudents'
import { StudentFilters } from '../features/students/components/StudentFilters'
import { StudentTable } from '../features/students/components/StudentTable'
import { StudentDetailDrawer } from '../features/students/components/StudentDetailDrawer'
import { AddStudentModal } from '../features/students/components/AddStudentModal'
import { CertificateModal } from '../features/certificates/components/CertificateModal'
import type { Student } from '../features/students/types'

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
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Alumni & Dropouts</h1>
            <p className="text-sm text-zinc-600 mt-1">Manage passed out, suspended, and departed students</p>
          </div>
          <button
            onClick={() => handleOpenCertificateModal(null)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-900/20 hover:scale-[1.02] active:scale-[0.98]"
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

      {/* ── Certificate Generator Modal ───────────────── */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        initialStudent={certStudent}
      />
    </>
  )
}
