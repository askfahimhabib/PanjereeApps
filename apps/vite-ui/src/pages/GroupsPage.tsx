import { useState } from 'react'
import { Plus, Search, Users, BookOpen, FlaskConical, ArrowRight, Pencil, Trash2, X } from 'lucide-react'
import { useGroups, type GroupRecord, type GroupName } from '@/features/groups/useGroups'

// ── Config ────────────────────────────────────────────────────────────────────

const GROUP_CFG: Record<GroupName, { label: string; labelBn: string; bg: string; text: string; border: string; gradFrom: string; gradTo: string; icon: typeof FlaskConical }> = {
  SCIENCE:  { label: 'Science',  labelBn: 'Science',  bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   gradFrom: 'from-blue-500',   gradTo: 'to-cyan-500',   icon: FlaskConical },
  ARTS:     { label: 'Arts',     labelBn: 'Arts',     bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', gradFrom: 'from-purple-500', gradTo: 'to-pink-500',   icon: BookOpen },
  COMMERCE: { label: 'Commerce', labelBn: 'Commerce', bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  gradFrom: 'from-amber-500',  gradTo: 'to-orange-500', icon: ArrowRight },
}

// ── Component ────────────────────────────────────────────────────────────────

export function GroupsPage() {
  const {
    filtered, byClass, stats,
    activeClasses,
    filterClass, setFilterClass,
    filterGroup, setFilterGroup,
    search, setSearch,
    deleteGroup, saveGroup,
  } = useGroups()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<GroupRecord | null>(null)

  const openEdit = (g: GroupRecord) => { setEditing(g); setIsModalOpen(true) }
  const openAdd  = () => { setEditing(null); setIsModalOpen(true) }
  const closeModal = () => { setIsModalOpen(false); setEditing(null) }

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Groups</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage Science, Arts, and Commerce groups by class</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20 shrink-0">
          <Plus size={17} />
          New Group
        </button>
      </div>

      {/* ── Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Groups',   value: stats.total,         color: 'text-zinc-700',    bg: 'bg-zinc-100' },
          { label: 'Science',        value: stats.science,       color: 'text-blue-700',    bg: 'bg-blue-50' },
          { label: 'Arts',           value: stats.arts,          color: 'text-purple-700',  bg: 'bg-purple-50' },
          { label: 'Commerce',       value: stats.commerce,      color: 'text-amber-700',   bg: 'bg-amber-50' },
          { label: 'Total Students', value: stats.totalStudents, color: 'text-emerald-700', bg: 'bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-zinc-100 rounded-2xl p-4 shadow-sm`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────── */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-44">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Class..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
        </div>
        {/* Dynamic class dropdown from store */}
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
          className="px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none">
          <option value="ALL">All Classes</option>
          {activeClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl">
          {(['ALL', 'SCIENCE', 'ARTS', 'COMMERCE'] as const).map(g => (
            <button key={g} onClick={() => setFilterGroup(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filterGroup === g ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}>
              {g === 'ALL' ? 'All' : GROUP_CFG[g as GroupName].labelBn}
            </button>
          ))}
        </div>
      </div>

      {/* ── Groups by Class ──────────────────────────────── */}
      {byClass.length === 0 ? (
        <div className="bg-white border border-zinc-100 rounded-2xl p-12 text-center shadow-sm">
          <Users size={36} className="mx-auto mb-3 text-zinc-200" />
          <p className="font-semibold text-zinc-700">No groups found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {byClass.map(({ classId, className, groups: classGroups }) => (
            <div key={classId} className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-zinc-50 border-b border-zinc-100">
                <span className="font-bold text-zinc-800">{className}</span>
                <span className="text-xs text-zinc-500 ml-2">{classGroups.length} Groups</span>
              </div>
              <div className="p-4 grid sm:grid-cols-3 gap-3">
                {classGroups.map(g => {
                  const cfg = GROUP_CFG[g.name]
                  const Icon = cfg.icon
                  return (
                    <div key={g.id} className={`relative rounded-xl border ${cfg.border} ${cfg.bg} p-4 group`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.gradFrom} ${cfg.gradTo} flex items-center justify-center text-white shrink-0`}>
                          <Icon size={17} />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(g)} className={`p-1.5 rounded-lg hover:bg-white/60 ${cfg.text} transition-colors`}><Pencil size={13} /></button>
                          <button onClick={() => deleteGroup(g.id)} className="p-1.5 rounded-lg hover:bg-white/60 text-red-500 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      <p className={`font-bold text-[15px] ${cfg.text}`}>{cfg.labelBn}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 font-medium">{cfg.label}</p>
                      <div className="mt-3 pt-3 border-t border-current/10 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className={`text-lg font-bold ${cfg.text}`}>{g.totalStudents}</p>
                          <p className="text-[10px] text-zinc-500">Students</p>
                        </div>
                        <div>
                          <p className={`text-lg font-bold ${cfg.text}`}>{g.totalSections}</p>
                          <p className="text-[10px] text-zinc-500">Sections</p>
                        </div>
                        <div>
                          <p className={`text-lg font-bold ${cfg.text}`}>{g.totalSubjects}</p>
                          <p className="text-[10px] text-zinc-500">Subjects</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────────── */}
      {isModalOpen && (
        <GroupModal
          editing={editing}
          activeClasses={activeClasses}
          onClose={closeModal}
          onSave={data => { saveGroup(editing, data); closeModal() }}
        />
      )}
    </div>
  )
}

// ── Group Modal ───────────────────────────────────────────────────────────────

function GroupModal({ editing, activeClasses, onClose, onSave }: {
  editing: GroupRecord | null
  activeClasses: { id: string; name: string }[]
  onClose: () => void
  onSave: (d: Pick<GroupRecord, 'classId' | 'className' | 'name'>) => void
}) {
  const [classId, setClassId] = useState(editing?.classId ?? activeClasses[0]?.id ?? '')
  const [name, setName] = useState<GroupName>(editing?.name ?? 'SCIENCE')

  const selectedClass = activeClasses.find(c => c.id === classId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="font-bold text-zinc-900">{editing ? 'Edit Group' : 'New Group'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">Class *</label>
            <select value={classId} onChange={e => setClassId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none">
              {activeClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">Group *</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(GROUP_CFG) as GroupName[]).map(g => {
                const cfg = GROUP_CFG[g]
                const Icon = cfg.icon
                return (
                  <button key={g} type="button" onClick={() => setName(g)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all ${name === g ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-current/20` : 'border-zinc-200 text-zinc-500'}`}>
                    <Icon size={18} />
                    {cfg.labelBn}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">Cancel</button>
            <button onClick={() => onSave({ classId, className: selectedClass?.name ?? classId, name })}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
              {editing ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
