import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Bell,
  Send,
} from 'lucide-react'
import { noticeStore } from '@/data/stores'
import type { NoticePriority, NoticeTarget } from '@/features/notices/types'

interface QuickNoticeModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function QuickNoticeModal({
  open,
  onClose,
  onSuccess,
}: QuickNoticeModalProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [priority, setPriority] = useState<NoticePriority>('IMPORTANT')
  const [target, setTarget] = useState<NoticeTarget>('ALL')

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return

    noticeStore.insert({
      id: crypto.randomUUID(),
      title: title.trim(),
      body: body.trim(),
      priority,
      target,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      createdBy: 'Academic Head / Principal',
    })

    setTitle('')
    setBody('')
    onSuccess?.()
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200/80">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-600">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Post Urgent Notice</h2>
              <p className="text-xs text-zinc-400">Broadcast circular to school portal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Early Dismissal for Annual Sports Preparation"
              className="w-full h-10 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 text-xs text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as NoticePriority)}
                className="w-full h-10 bg-zinc-50 border border-zinc-200 rounded-xl px-3 text-xs text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              >
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent (Red Alert)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Audience</label>
              <select
                value={target}
                onChange={e => setTarget(e.target.value as NoticeTarget)}
                className="w-full h-10 bg-zinc-50 border border-zinc-200 rounded-xl px-3 text-xs text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              >
                <option value="ALL">All (Students & Teachers)</option>
                <option value="STUDENTS">Students Only</option>
                <option value="TEACHERS">Teachers & Staff Only</option>
                <option value="PARENTS">Parents Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Notice Content *</label>
            <textarea
              required
              rows={4}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write detailed circular or announcement..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-xs text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer"
            >
              <Send size={13} />
              <span>Broadcast Notice</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
