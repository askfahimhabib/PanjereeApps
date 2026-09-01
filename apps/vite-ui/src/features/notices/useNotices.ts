import { useState } from 'react'
import { noticeStore } from '@/data/stores'
import type { Notice, CreateNoticeDto } from './types'

export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>(() =>
    noticeStore.getAll().sort((a, b) => {
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
      noticeStore.getAll().sort((a, b) => {
        const priorityOrder = { URGENT: 0, IMPORTANT: 1, NORMAL: 2 }
        const pa = priorityOrder[a.priority]
        const pb = priorityOrder[b.priority]
        if (pa !== pb) return pa - pb
        return b.publishedAt.localeCompare(a.publishedAt)
      })
    )
  }

  const createNotice = (dto: CreateNoticeDto) => {
    noticeStore.insert({
      id: crypto.randomUUID(),
      ...dto,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      createdBy: 'Academic Head',
    })
    refresh()
  }

  const updateNotice = (id: string, dto: Partial<CreateNoticeDto>) => {
    noticeStore.update(id, dto)
    refresh()
  }

  const deleteNotice = (id: string) => {
    noticeStore.remove(id)
    refresh()
  }

  const togglePublish = (id: string) => {
    const notice = noticeStore.getOne(id)
    if (!notice) return
    noticeStore.update(id, { isPublished: !notice.isPublished })
    refresh()
  }

  return { notices, createNotice, updateNotice, deleteNotice, togglePublish, refresh }
}
