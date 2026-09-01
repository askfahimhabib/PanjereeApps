import { useNavigate } from 'react-router-dom'
import { UserPlus, Printer } from 'lucide-react'
import { useTeachers } from '../features/teachers/useTeachers'
import { StatsCards } from '../features/teachers/components/StatsCards'
import { TeacherFilters } from '../features/teachers/components/TeacherFilters'
import { TeacherTable } from '../features/teachers/components/TeacherTable'
import { AddTeacherModal } from '../features/teachers/components/AddTeacherModal'
import { DESIGNATION_LABELS, DEPARTMENT_LABELS } from '../features/teachers/types'

export function Teachers() {
  const navigate = useNavigate()
  const {
    filteredTeachers,
    paginatedTeachers,
    stats,
    filters,
    updateFilter,
    resetFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    isModalOpen,
    openModal,
    closeModal,
    editingTeacherId,
    formData,
    updateFormData,
    currentStep,
    nextStep,
    prevStep,
    submitTeacher,
    deleteTeacher,
    teachers,
  } = useTeachers()

  const handlePrintDirectory = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const rows = teachers.map((t, idx) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px 12px; font-family: monospace;">${idx + 1}</td>
        <td style="padding: 8px 12px;"><strong>${t.fullName}</strong>${t.nameBangla ? `<br/><span style="color:#6b7280; font-size:11px;">${t.nameBangla}</span>` : ''}</td>
        <td style="padding: 8px 12px; font-family: monospace; color: #4f46e5;">${t.teacherId}</td>
        <td style="padding: 8px 12px;">${DESIGNATION_LABELS[t.designation] || t.designation}</td>
        <td style="padding: 8px 12px;">${t.department ? (DEPARTMENT_LABELS[t.department] || t.department) : 'General'}</td>
        <td style="padding: 8px 12px; font-family: monospace;">${t.phone}</td>
        <td style="padding: 8px 12px;">${t.teacherCategory === 'REGULAR' ? 'Regular' : 'Guest'}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Faculty Directory - Estudy International Model Academy</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 20px; margin-bottom: 4px; font-weight: 800; }
            p { font-size: 12px; color: #6b7280; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 16px; }
            th { background-color: #f3f4f6; text-align: left; padding: 8px 12px; border-bottom: 2px solid #d1d5db; font-size: 11px; text-transform: uppercase; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h1>Estudy International Model Academy</h1>
              <p>Official Teaching Faculty & Staff Directory • Total: ${teachers.length} Members</p>
            </div>
            <button onclick="window.print()" style="padding: 8px 16px; background:#4f46e5; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:12px;">
              🖨️ Print Directory
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Teacher Name</th>
                <th>Teacher ID</th>
                <th>Designation</th>
                <th>Department / Subject</th>
                <th>Phone Number</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="space-y-5">
      {/* ── Page Header ────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Teachers & Faculty</h1>
          <p className="text-sm text-zinc-600 mt-0.5">
            Manage faculty profiles, class workload, salary desk, and assignments
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrintDirectory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
            title="Print Official Staff Directory for Notice Board"
          >
            <Printer size={15} />
            Print Directory
          </button>

          <button
            id="add-teacher-btn"
            onClick={() => openModal()}
            className="btn-primary cursor-pointer"
          >
            <UserPlus size={16} />
            Add Faculty Member
          </button>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────── */}
      <StatsCards stats={stats} />

      {/* ── Filter Bar ─────────────────────────────────── */}
      <TeacherFilters
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        totalResults={filteredTeachers.length}
        stats={stats}
      />

      {/* ── Table (Navigates directly to Main Profile) ── */}
      <TeacherTable
        teachers={paginatedTeachers}
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={filteredTeachers.length}
        onPageChange={setCurrentPage}
        onView={(teacher) => navigate(`/teachers/${teacher.id}`)}
        onDelete={deleteTeacher}
      />

      {/* ── Add / Edit Modal ───────────────────────────── */}
      <AddTeacherModal
        isOpen={isModalOpen}
        isEdit={Boolean(editingTeacherId)}
        onClose={closeModal}
        currentStep={currentStep}
        formData={formData}
        onChange={updateFormData}
        onNext={nextStep}
        onPrev={prevStep}
        onSubmit={submitTeacher}
      />
    </div>
  )
}
