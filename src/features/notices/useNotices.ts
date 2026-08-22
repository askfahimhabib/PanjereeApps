import { useState } from 'react'
import { createStore } from '@/lib/localStore'
import type { Notice, CreateNoticeDto } from './types'

// ─── Store ────────────────────────────────────────────────────

const store = createStore<Notice>('notices')

// ─── Hook ─────────────────────────────────────────────────────

export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>(() =>
    store.getAll().sort((a, b) => {
      // Pinning: URGENT first, then IMPORTANT, then NORMAL; within each group, newest first
      const priorityOrder = { URGENT: 0, IMPORTANT: 1, NORMAL: 2 }
      const pa = priorityOrder[a.priority]
      const pb = priorityOrder[b.priority]
      if (pa !== pb) return pa - pb
      return b.publishedAt.localeCompare(a.publishedAt)
    })
  )

  const refresh = () => {
    setNotices(
      store.getAll().sort((a, b) => {
        const priorityOrder = { URGENT: 0, IMPORTANT: 1, NORMAL: 2 }
        const pa = priorityOrder[a.priority]
        const pb = priorityOrder[b.priority]
        if (pa !== pb) return pa - pb
        return b.publishedAt.localeCompare(a.publishedAt)
      })
    )
  }

  const createNotice = (dto: CreateNoticeDto) => {
    store.insert({
      id: crypto.randomUUID(),
      ...dto,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      createdBy: 'Admin',
    })
    refresh()
  }

  const deleteNotice = (id: string) => {
    store.remove(id)
    refresh()
  }

  const togglePublish = (id: string) => {
    const notice = store.getOne(id)
    if (!notice) return
    store.update(id, { isPublished: !notice.isPublished })
    refresh()
  }

  return { notices, createNotice, deleteNotice, togglePublish }
}
