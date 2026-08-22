import { User, Phone, Mail, MapPin, MessageCircle, Fingerprint, Heart, Globe } from 'lucide-react'
import type { Teacher } from '../../types'
import { GENDER_LABELS, DIVISION_LABELS } from '../../types'

interface Props { teacher: Teacher }

function InfoRow({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: React.ElementType }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon size={15} className="text-slate-500 mt-0.5 shrink-0" />}
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-200 font-medium">{value}</p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

export function BasicInfoTab({ teacher }: Props) {
  const age = teacher.dateOfBirth
    ? Math.floor((Date.now() - new Date(teacher.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null

  return (
    <div className="space-y-6">
      {/* Personal */}
      <Section title="Personal Information">
        <InfoRow label="Full Name (English)" value={teacher.fullName} icon={User} />
        <InfoRow label="Full Name (Bengali)" value={teacher.nameBangla} icon={User} />
        <InfoRow label="First Name" value={teacher.firstName} />
        <InfoRow label="Last Name" value={teacher.lastName} />
        <InfoRow label="Gender" value={teacher.gender ? GENDER_LABELS[teacher.gender] : undefined} />
        <InfoRow label="Date of Birth" value={teacher.dateOfBirth ? `${teacher.dateOfBirth} (Age: ${age})` : undefined} />
        <InfoRow label="Blood Group" value={teacher.bloodGroup} icon={Heart} />
        <InfoRow label="Nationality" value={teacher.nationality} icon={Globe} />
        <InfoRow label="NID Number" value={teacher.nidNumber} icon={Fingerprint} />
        <InfoRow label="Birth Certificate No." value={teacher.birthCertificateNumber} />
        <InfoRow label="Marital Status" value={teacher.maritalStatus} />
        <InfoRow label="Religion" value={teacher.religion} />
      </Section>

      {/* Contact */}
      <Section title="Contact Information">
        <InfoRow label="Phone Number" value={teacher.phone} icon={Phone} />
        <InfoRow label="Alternative Phone" value={teacher.alternativePhone} icon={Phone} />
        <InfoRow label="Email" value={teacher.email} icon={Mail} />
        <InfoRow label="WhatsApp" value={teacher.whatsapp} icon={MessageCircle} />
      </Section>

      {/* Address */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Address</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin size={15} className="text-slate-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Present Address</p>
              <p className="text-sm text-slate-200 font-medium">{teacher.presentAddress || '—'}</p>
            </div>
          </div>
          {teacher.permanentAddress && teacher.permanentAddress !== teacher.presentAddress && (
            <div className="flex items-start gap-3">
              <MapPin size={15} className="text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Permanent Address</p>
                <p className="text-sm text-slate-200 font-medium">{teacher.permanentAddress}</p>
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {teacher.division && <InfoRow label="Division" value={DIVISION_LABELS[teacher.division]} />}
          {teacher.district && <InfoRow label="District" value={teacher.district} />}
          {teacher.upazila  && <InfoRow label="Upazila" value={teacher.upazila} />}
          {teacher.area     && <InfoRow label="Area" value={teacher.area} />}
          {teacher.postalCode && <InfoRow label="Postal Code" value={teacher.postalCode} />}
        </div>
      </div>
    </div>
  )
}
