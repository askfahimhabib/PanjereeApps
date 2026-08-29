import { Hash, GraduationCap, Phone, Users, Shield, Calendar } from 'lucide-react'
import type { Student } from '../../types'
import { GENDER_LABELS, GROUP_LABELS } from '../../types'
import { InfoRow, Section } from './shared'

export function ProfileTab({ student }: { student: Student }) {
  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <Section title="Basic Information" icon={Hash}>
        <InfoRow label="Registration No."  value={student.registrationNumber} />
        <InfoRow label="Gender"             value={student.gender ? GENDER_LABELS[student.gender] : undefined} />
        <InfoRow label="Date of Birth"      value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-BD') : undefined} />
        <InfoRow label="Religion"           value={student.religion} />
        <InfoRow label="Nationality"        value={student.nationality} />
      </Section>

      {/* Academic Info */}
      <Section title="Academic Information" icon={GraduationCap}>
        {student.type === 'REGULAR' ? (
          <>
            <InfoRow label="Class"   value={student.className} />
            <InfoRow label="Section" value={student.sectionName ? `Section ${student.sectionName}` : undefined} />
            <InfoRow label="Group"   value={student.groupId ? GROUP_LABELS[student.groupId] : undefined} />
            <InfoRow label="Shift"   value={student.shift ? student.shift.charAt(0) + student.shift.slice(1).toLowerCase() : undefined} />
          </>
        ) : (
          <>
            <InfoRow label="Batch"        value={student.batchName} />
            <InfoRow label="Target Exam"  value={student.targetExam} />
            <InfoRow label="Previous School" value={student.previousSchool} />
          </>
        )}
        <InfoRow label="Version"          value={student.version ? student.version.charAt(0) + student.version.slice(1).toLowerCase() + ' Medium' : undefined} />
        <InfoRow label="Session"          value={student.session} />
        <InfoRow label="Admission Date"   value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-BD') : undefined} />
        <InfoRow label="Admission No."    value={student.admissionNumber} />
      </Section>

      {/* Contact Info */}
      <Section title="Contact Information" icon={Phone}>
        <InfoRow label="Mobile"    value={student.mobile} />
        <InfoRow label="WhatsApp"  value={student.whatsapp} />
        <InfoRow label="Email"     value={student.email} />
        <div className="col-span-2">
          <InfoRow label="Present Address"   value={student.presentAddress} />
        </div>
        {student.permanentAddress && (
          <div className="col-span-2">
            <InfoRow label="Permanent Address" value={student.permanentAddress} />
          </div>
        )}
      </Section>

      {/* Parent Info */}
      <Section title="Parent / Guardian" icon={Users}>
        <InfoRow label="Father's Name"   value={student.father.name} />
        <InfoRow label="Father's Mobile" value={student.father.mobile} />
        <InfoRow label="Occupation"      value={student.father.occupation} />
        <div className="col-span-2 border-t border-zinc-100 pt-3 mt-1">
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Mother's Name"   value={student.mother.name} />
            <InfoRow label="Mother's Mobile" value={student.mother.mobile} />
          </div>
        </div>
        {student.guardian && (
          <div className="col-span-2 border-t border-zinc-100 pt-3 mt-1">
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Guardian"  value={`${student.guardian.name} (${student.guardian.relation})`} />
              <InfoRow label="Mobile"    value={student.guardian.mobile} />
            </div>
          </div>
        )}
      </Section>

      {/* Auth */}
      <Section title="Login Access" icon={Shield}>
        <InfoRow label="Username"     value={student.username} />
        <InfoRow label="Login Status" value={student.loginStatus === 'ACTIVE' ? '✅ Active' : '⛔ Inactive'} />
      </Section>

      {/* System */}
      <Section title="System Information" icon={Calendar}>
        <InfoRow label="Created At" value={new Date(student.createdAt).toLocaleDateString('en-BD')} />
        <InfoRow label="Updated At" value={new Date(student.updatedAt).toLocaleDateString('en-BD')} />
        <InfoRow label="Created By" value={student.createdBy} />
      </Section>

      {/* Custom Fields */}
      {student.customFields && student.customFields.length > 0 && (
        <div className="border border-zinc-100 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-zinc-100">
            <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">Custom Fields</span>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {student.customFields.map((cf, i) => (
              <InfoRow key={i} label={cf.key} value={cf.value} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
