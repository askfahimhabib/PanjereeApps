import { useState, useMemo, useEffect } from 'react'
import { X, Search, Check, AlertCircle } from 'lucide-react'
import type { Student } from '../types'
import { MOCK_CLASSES } from '../mockData'

interface Props {
  isOpen: boolean
  onClose: () => void
  students: Student[]
  onPromote: (studentIds: string[], targetClassId: string, targetSession: string) => void
}

export function PromoteStudentsModal({ isOpen, onClose, students, onPromote }: Props) {
  const [sourceClass, setSourceClass] = useState('')
  const [sourceSession, setSourceSession] = useState('')
  
  const [targetClass, setTargetClass] = useState('')
  const [targetSession, setTargetSession] = useState('')

  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Dynamically set default sessions based on the latest available student data
  useEffect(() => {
    if (isOpen) {
      let latest = new Date().getFullYear()
      if (students.length > 0) {
        const sessions = students.map(s => parseInt(s.session)).filter(y => !isNaN(y))
        if (sessions.length > 0) {
          latest = Math.max(...sessions)
        }
      }
      setSourceSession(latest.toString())
      setTargetSession((latest + 1).toString())
      
      // Reset other states when modal opens
      setSourceClass('')
      setTargetClass('')
      setSearch('')
      setSelectedIds(new Set())
    }
  }, [isOpen, students])

  // Filter regular active students matching source criteria
  const eligibleStudents = useMemo(() => {
    return students.filter(
      s => s.type === 'REGULAR' && 
           s.status === 'ACTIVE' &&
           s.classId === sourceClass &&
           s.session === sourceSession &&
           (search === '' || s.fullNameEn.toLowerCase().includes(search.toLowerCase()) || s.studentId.includes(search))
    )
  }, [students, sourceClass, sourceSession, search])

  // Select all or deselect all when eligible list changes or user clicks master checkbox
  const toggleAll = () => {
    if (selectedIds.size === eligibleStudents.length && eligibleStudents.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(eligibleStudents.map(s => s.id)))
    }
  }

  const toggleStudent = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handlePromote = () => {
    if (selectedIds.size === 0 || !targetClass || !targetSession) return
    onPromote(Array.from(selectedIds), targetClass, targetSession)
    
    // Reset and close
    setSourceClass('')
    setTargetClass('')
    setSelectedIds(new Set())
    onClose()
  }

  if (!isOpen) return null

  const inputCls = "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
  const labelCls = "block text-xs font-medium text-slate-400 mb-1.5"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Promote Students</h2>
            <p className="text-sm text-slate-400">Migrate students to the next class and session</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Panel: Configuration */}
          <div className="w-full md:w-1/3 bg-slate-800/50 border-r border-slate-700 p-6 flex flex-col gap-6 shrink-0">
            {/* Source */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">1</span>
                <h3 className="text-sm font-semibold text-slate-200">Select Source</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Current Class</label>
                  <select value={sourceClass} onChange={e => { setSourceClass(e.target.value); setSelectedIds(new Set()) }} className={inputCls}>
                    <option value="">Select class...</option>
                    {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Current Session</label>
                  <input type="text" value={sourceSession} onChange={e => { setSourceSession(e.target.value); setSelectedIds(new Set()) }} className={inputCls} placeholder="e.g. 2024" />
                </div>
              </div>
            </div>

            {/* Target */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">2</span>
                <h3 className="text-sm font-semibold text-slate-200">Select Target</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Next Class</label>
                  <select value={targetClass} onChange={e => setTargetClass(e.target.value)} className={inputCls}>
                    <option value="">Select next class...</option>
                    {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Next Session</label>
                  <input type="text" value={targetSession} onChange={e => setTargetSession(e.target.value)} className={inputCls} placeholder="e.g. 2025" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Student List */}
          <div className="w-full md:w-2/3 p-6 flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200">
                Eligible Students {eligibleStudents.length > 0 && `(${selectedIds.size}/${eligibleStudents.length})`}
              </h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-200 focus:border-blue-500 transition-colors outline-none"
                />
              </div>
            </div>

            {!sourceClass || !sourceSession ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 border border-dashed border-slate-700 rounded-xl bg-slate-900/20">
                <AlertCircle size={32} className="text-slate-600" />
                <p className="text-sm">Please select a Source Class and Session first.</p>
              </div>
            ) : eligibleStudents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 border border-dashed border-slate-700 rounded-xl bg-slate-900/20">
                <AlertCircle size={32} className="text-slate-600" />
                <p className="text-sm">No students found for this class and session.</p>
              </div>
            ) : (
              <div className="flex-1 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
                <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 p-3 bg-slate-900 border-b border-slate-700 items-center">
                  <div className="w-8 flex justify-center">
                    <button 
                      onClick={toggleAll}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        selectedIds.size === eligibleStudents.length
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-slate-800 border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {selectedIds.size === eligibleStudents.length && <Check size={12} className="text-white" />}
                    </button>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Student Name</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase">ID / Roll</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase w-20 text-center">Status</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {eligibleStudents.map(student => (
                    <div 
                      key={student.id} 
                      className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors items-center cursor-pointer"
                      onClick={() => toggleStudent(student.id)}
                    >
                      <div className="w-8 flex justify-center">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          selectedIds.has(student.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-slate-800 border-slate-600'
                        }`}>
                          {selectedIds.has(student.id) && <Check size={12} className="text-white" />}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{student.fullNameEn}</p>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400">{student.studentId}</span>
                        <span className="text-xs text-slate-500">Roll: {student.rollNumber}</span>
                      </div>
                      <div className="w-20 flex justify-center">
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-900/50 shrink-0 rounded-b-2xl">
          <div className="text-sm text-slate-400">
            {selectedIds.size} student(s) selected
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Cancel
            </button>
            <button 
              onClick={handlePromote}
              disabled={selectedIds.size === 0 || !targetClass || !targetSession}
              className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-lg shadow-blue-900/20"
            >
              Promote Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
