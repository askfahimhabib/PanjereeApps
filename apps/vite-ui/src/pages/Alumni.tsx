import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { useStudents } from '../features/students/useStudents'
import { StudentFilters } from '../features/students/components/StudentFilters'
import { StudentTable } from '../features/students/components/StudentTable'
import { AddStudentModal } from '../features/students/components/AddStudentModal'
import { CertificateModal } from '../features/certificates/components/CertificateModal'
import type { Student } from '../features/students/types'

export function Alumni() {
  const navigate = useNavigate()
  const {
    filteredStudents, paginatedStudents,
    filters, updateFilter, resetFilters,
    currentPage, setCurrentPage, totalPages,
    isModalOpen, closeModal,
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
            className="btn-primary cursor-pointer"
          >
            <GraduationCap size={16} />
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

        {/* ── Table (Navigates directly to Main Profile) ── */}
        <StudentTable
          students={paginatedStudents}
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={filteredStudents.length}
          onPageChange={setCurrentPage}
          onView={(student) => navigate(`/students/${student.id}`)}
          onDelete={deleteStudent}
          onCertificate={(student) => handleOpenCertificateModal(student)}
        />
      </div>

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
