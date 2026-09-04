import React from 'react'
import {
  Sparkles,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react'

export interface ProfileHeroBannerProps {
  // Identity
  fullName: string
  subtitle?: string
  banglaName?: string
  avatarUrl?: string
  initials: string
  roleBadgeText: string
  roleColor?: string
  statusText?: string
  statusVariant?: 'success' | 'warning' | 'danger' | 'info'
  sessionText?: string
  institutionText?: string

  // Meta chips (Roll, ID, Class, Dept, etc.)
  metaChips?: { label: string; value: string; isMono?: boolean; highlight?: boolean }[]

  // Contact quick access
  contacts?: {
    mobile?: string
    email?: string
    whatsapp?: string
    location?: string
  }

  // Action buttons
  primaryAction?: {
    label: string
    icon?: React.ElementType
    onClick: () => void
    variant?: 'primary' | 'emerald' | 'indigo'
  }
  secondaryActions?: {
    label: string
    icon: React.ElementType
    onClick: () => void
    color?: string
  }[]
  dangerAction?: {
    label: string
    onClick: () => void
  }
}

export function ProfileHeroBanner({
  fullName,
  subtitle,
  banglaName,
  avatarUrl,
  initials,
  roleBadgeText,
  roleColor = 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
  statusText = 'Active',
  statusVariant = 'success',
  sessionText = 'Session 2026',
  institutionText = 'Estudy International Model Academy',
  metaChips = [],
  contacts,
  primaryAction,
  secondaryActions = [],
  dangerAction,
}: ProfileHeroBannerProps) {
  const [menuOpen, setMenuOpen] = React.useState(false)

  const handleWhatsApp = (number?: string) => {
    if (!number) return
    const cleanNumber = number.replace(/[^0-9]/g, '')
    const url = `https://wa.me/${cleanNumber.startsWith('88') ? cleanNumber : `88${cleanNumber}`}?text=Assalamu%20Alaikum,%20regarding%20${encodeURIComponent(fullName)}.`
    window.open(url, '_blank')
  }

  return (
    <div className="bg-white border border-zinc-200/90 rounded-3xl overflow-hidden shadow-sm">
      {/* ── 1. Top Cover Banner (Stacking Context: relative z-0) ── */}
      <div className="h-36 sm:h-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden flex flex-col justify-between p-5 sm:p-6 select-none">
        {/* Subtle geometric glowing radial highlights */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Top bar over banner */}
        <div className="relative z-10 flex items-center justify-between w-full text-white">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-white/10 backdrop-blur-md">
              <Sparkles size={14} className="text-amber-300" />
            </span>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-300">
              {institutionText}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-zinc-200">
              {sessionText}
            </span>
          </div>
        </div>

        {/* Bottom banner accent line */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span>Unified 360° Profile Hub</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 size={12} /> Live Verified Profile
          </span>
        </div>
      </div>

      {/* ── 2. Content & Avatar Bar (CRITICAL: relative z-20 to fix avatar background overlap) ── */}
      <div className="relative z-20 px-6 sm:px-8 pb-6 bg-white">
        <div className="flex flex-wrap items-end justify-between -mt-14 sm:-mt-16 mb-5 gap-4">
          {/* Avatar and Identity */}
          <div className="flex items-end gap-4 sm:gap-5">
            {/* Avatar container with explicit z-index, ring, elevation */}
            <div className="relative z-20 shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-2xl ring-4 ring-white overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" title="Online / Active" />
            </div>

            {/* Name & Quick Role Title */}
            <div className="mb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">{fullName}</h1>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${roleColor}`}>
                  {roleBadgeText}
                </span>
                <span
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${
                    statusVariant === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : statusVariant === 'warning'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}
                >
                  {statusText}
                </span>
              </div>

              {banglaName && (
                <p className="text-xs font-semibold text-zinc-500 mt-0.5">{banglaName}</p>
              )}

              {subtitle && (
                <p className="text-xs text-zinc-600 font-medium mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm cursor-pointer active:scale-95"
              >
                {primaryAction.icon && <primaryAction.icon size={14} />}
                {primaryAction.label}
              </button>
            )}

            {secondaryActions.map((act, idx) => {
              const Icon = act.icon
              return (
                <button
                  key={idx}
                  onClick={act.onClick}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Icon size={14} className={act.color || 'text-zinc-600'} />
                  <span>{act.label}</span>
                </button>
              )
            })}

            {/* WhatsApp Direct Action if available */}
            {contacts?.whatsapp && (
              <button
                onClick={() => handleWhatsApp(contacts.whatsapp)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all shadow-xs cursor-pointer"
                title="Open WhatsApp chat"
              >
                <MessageCircle size={14} className="text-emerald-600" /> WhatsApp
              </button>
            )}

            {/* More Menu (Danger Actions) */}
            {dangerAction && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 transition-all cursor-pointer"
                  title="More actions"
                >
                  <MoreVertical size={15} />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-zinc-200 rounded-xl shadow-lg z-40 py-1 text-xs">
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          dangerAction.onClick()
                        }}
                        className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
                      >
                        {dangerAction.label}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── 3. Meta Badges & Fast Info Strip ── */}
        {metaChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-100">
            {metaChips.map((chip, idx) => (
              <div
                key={idx}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${
                  chip.highlight
                    ? 'bg-indigo-50 border border-indigo-200/80 text-indigo-900'
                    : 'bg-zinc-50 border border-zinc-200/80 text-zinc-700'
                }`}
              >
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{chip.label}:</span>
                <span className={chip.isMono ? 'font-mono text-zinc-900' : 'text-zinc-900 font-bold'}>{chip.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── 4. Contact Row ── */}
        {contacts && (contacts.mobile || contacts.email || contacts.location) && (
          <div className="flex flex-wrap items-center gap-5 mt-3 pt-3 border-t border-zinc-100 text-xs text-zinc-600">
            {contacts.mobile && (
              <a href={`tel:${contacts.mobile}`} className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors font-medium">
                <Phone size={13} className="text-zinc-400" /> {contacts.mobile}
              </a>
            )}
            {contacts.email && (
              <a href={`mailto:${contacts.email}`} className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors font-medium">
                <Mail size={13} className="text-zinc-400" /> {contacts.email}
              </a>
            )}
            {contacts.location && (
              <div className="flex items-center gap-1.5 text-zinc-500 truncate max-w-sm">
                <MapPin size={13} className="text-zinc-400 shrink-0" /> <span className="truncate">{contacts.location}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
