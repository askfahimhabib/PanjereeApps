import { User, Lock, Activity, Shield, Clock } from 'lucide-react'
import { useProfileStore } from '../store/profile'
import { AvatarUpload } from '../features/profile/components/AvatarUpload'
import { PersonalInfoForm } from '../features/profile/components/PersonalInfoForm'
import { PasswordChangeForm } from '../features/profile/components/PasswordChangeForm'
import { ActivityLog } from '../features/profile/components/ActivityLog'

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-start gap-4 mb-5">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
          <Icon size={18} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-900">{title}</h2>
          <p className="text-sm text-zinc-600 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="bg-white border border-zinc-100 rounded-2xl p-5">
        {children}
      </div>
    </section>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-BD', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function AdminProfile() {
  const profile = useProfileStore()

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────── */}
      <div className="flex items-start gap-6">
        {/* Avatar + name */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden shrink-0">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
          ) : (
            profile.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{profile.fullName}</h1>
          <p className="text-sm text-zinc-600 mt-0.5">{profile.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Shield size={10} /> {profile.role}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-600">
              <Clock size={11} /> Last login: {formatDate(profile.lastLogin)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Avatar Upload ─────────────────────────── */}
      <Section icon={User} title="Profile Photo" description="Upload a photo to personalize your account.">
        <AvatarUpload />
      </Section>

      {/* ── Personal Info ─────────────────────────── */}
      <Section icon={User} title="Personal Information" description="Update your name, email, and contact details.">
        <PersonalInfoForm />
      </Section>

      {/* ── Password ─────────────────────────────── */}
      <Section icon={Lock} title="Change Password" description="Keep your account secure with a strong password.">
        <PasswordChangeForm />
      </Section>

      {/* ── Activity Log ─────────────────────────── */}
      <Section icon={Activity} title="Recent Activity" description="Your last 50 actions in the system.">
        <ActivityLog />
      </Section>
    </div>
  )
}
