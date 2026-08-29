import { User, Shield, Clock, Phone, Mail } from 'lucide-react'
import type { Teacher } from '../../types'
import { ROLE_LABELS, ACCOUNT_STATUS_COLORS } from '../../types'

interface Props { teacher: Teacher }

function InfoRow({ label, value, className }: { label: string; value?: string | null; className?: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-zinc-600">{label}</p>
      <p className={`text-sm font-medium mt-0.5 ${className || 'text-zinc-800'}`}>{value}</p>
    </div>
  )
}

export function SystemTab({ teacher }: Props) {
  return (
    <div className="space-y-6">
      {/* Account */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-2">
          <User size={14} /> Account Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teacher.username && (
            <div>
              <p className="text-xs text-zinc-600">Username</p>
              <p className="text-sm font-mono text-zinc-800 mt-0.5">@{teacher.username}</p>
            </div>
          )}
          {teacher.loginEmail && (
            <div className="flex items-start gap-2">
              <Mail size={13} className="text-zinc-600 mt-0.5" />
              <div>
                <p className="text-xs text-zinc-600">Login Email</p>
                <p className="text-sm text-zinc-800">{teacher.loginEmail}</p>
              </div>
            </div>
          )}
          {teacher.loginPhone && (
            <div className="flex items-start gap-2">
              <Phone size={13} className="text-zinc-600 mt-0.5" />
              <div>
                <p className="text-xs text-zinc-600">Login Phone</p>
                <p className="text-sm text-zinc-800">{teacher.loginPhone}</p>
              </div>
            </div>
          )}
          <div>
            <p className="text-xs text-zinc-600">Account Status</p>
            <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${ACCOUNT_STATUS_COLORS[teacher.accountStatus]}`}>
              {teacher.accountStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Role & Permissions */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-2">
          <Shield size={14} /> Role & Permissions
        </h4>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/20 flex items-center justify-center">
            <Shield size={14} className="text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-600">Role</p>
            <p className="text-sm font-semibold text-purple-300">{ROLE_LABELS[teacher.role]}</p>
          </div>
        </div>
        {teacher.permissions && teacher.permissions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {teacher.permissions.map(p => (
              <span key={p} className="text-xs bg-white border border-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Activity */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-2">
          <Clock size={14} /> System Activity
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teacher.lastLogin && (
            <div>
              <p className="text-xs text-zinc-600">Last Login</p>
              <p className="text-sm text-zinc-800">{new Date(teacher.lastLogin).toLocaleString()}</p>
            </div>
          )}
          <InfoRow label="Teacher ID" value={teacher.teacherId} />
          <InfoRow label="User ID" value={teacher.userId} />
          <InfoRow label="Employee ID" value={teacher.employeeId} />
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-100 pb-2">
          System Metadata
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-600">Created At</p>
            <p className="text-sm text-zinc-800">{new Date(teacher.createdAt).toLocaleString()}</p>
            <p className="text-xs text-zinc-600 mt-0.5">by {teacher.createdBy}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-600">Last Updated</p>
            <p className="text-sm text-zinc-800">{new Date(teacher.updatedAt).toLocaleString()}</p>
            <p className="text-xs text-zinc-600 mt-0.5">by {teacher.updatedBy}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-600">Active Status</p>
            <p className={`text-sm font-medium ${teacher.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
              {teacher.isActive ? '✓ Active Record' : '✗ Deleted / Archived'}
            </p>
          </div>
          {teacher.deletedAt && (
            <div>
              <p className="text-xs text-zinc-600">Deleted At</p>
              <p className="text-sm text-red-400">{new Date(teacher.deletedAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
