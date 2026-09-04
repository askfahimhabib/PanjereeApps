/**
 * supabaseStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop-in Supabase store adapter implementing the same Store<T> contract as localStore.
 * When Supabase credentials are provided in .env, stores in stores.ts can switch
 * to this adapter seamlessly without changing any UI hooks or components.
 */

import { supabase, isSupabaseConfigured } from './supabase'
import type { Store } from './localStore'

export function createSupabaseStore<T extends { id: string }>(tableName: string): Store<T> {
  // In-memory cache for synchronous read support in legacy hooks
  let memoryCache: T[] = []

  const storageKey = `lms_store_${tableName}`

  // Load from localStorage as immediate fast fallback before network returns
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) memoryCache = JSON.parse(raw)
  } catch {
    memoryCache = []
  }

  function notifyUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_store_updated', { detail: { key: tableName } }))
    }
  }

  function syncToLocalStorage(items: T[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items))
    } catch {
      // ignore storage quota errors
    }
  }

  // Initial fetch from Supabase if configured
  if (isSupabaseConfigured()) {
    supabase
      .from(tableName)
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) {
          memoryCache = data as unknown as T[]
          syncToLocalStorage(memoryCache)
          notifyUpdate()
        }
      })

    // Enable Supabase Realtime subscription
    supabase
      .channel(`realtime_${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newItem = payload.new as T
          if (!memoryCache.some(item => item.id === newItem.id)) {
            memoryCache = [newItem, ...memoryCache]
          }
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as T
          memoryCache = memoryCache.map(item => (item.id === updated.id ? updated : item))
        } else if (payload.eventType === 'DELETE') {
          const oldId = payload.old?.id
          memoryCache = memoryCache.filter(item => item.id !== oldId)
        }
        syncToLocalStorage(memoryCache)
        notifyUpdate()
      })
      .subscribe()
  }

  return {
    getAll() {
      return memoryCache
    },

    getWhere(predicate: (item: T) => boolean) {
      return memoryCache.filter(predicate)
    },

    getOne(id: string) {
      return memoryCache.find(item => item.id === id)
    },

    insert(item: T) {
      memoryCache = [item, ...memoryCache.filter(i => i.id !== item.id)]
      syncToLocalStorage(memoryCache)
      notifyUpdate()

      if (isSupabaseConfigured()) {
        supabase
          .from(tableName)
          .insert(item as any)
          .then(({ error }) => {
            if (error) console.error(`[SupabaseStore:${tableName}] Insert error:`, error.message)
          })
      }
      return item
    },

    update(id: string, partial: Partial<T>) {
      const index = memoryCache.findIndex(item => item.id === id)
      if (index === -1) {
        throw new Error(`[SupabaseStore:${tableName}] Item not found: ${id}`)
      }
      const updated = { ...memoryCache[index], ...partial } as T
      memoryCache[index] = updated
      syncToLocalStorage(memoryCache)
      notifyUpdate()

      if (isSupabaseConfigured()) {
        supabase
          .from(tableName)
          .update(partial as any)
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.error(`[SupabaseStore:${tableName}] Update error:`, error.message)
          })
      }
      return updated
    },

    remove(id: string) {
      memoryCache = memoryCache.filter(item => item.id !== id)
      syncToLocalStorage(memoryCache)
      notifyUpdate()

      if (isSupabaseConfigured()) {
        supabase
          .from(tableName)
          .delete()
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.error(`[SupabaseStore:${tableName}] Delete error:`, error.message)
          })
      }
    },

    seed(items: T[]) {
      if (memoryCache.length === 0) {
        memoryCache = items
        syncToLocalStorage(items)
        if (isSupabaseConfigured()) {
          supabase
            .from(tableName)
            .select('id', { count: 'exact', head: true })
            .then(({ count }) => {
              if (count === 0) {
                supabase.from(tableName).insert(items as any).then()
              }
            })
        }
      }
    },

    clear() {
      memoryCache = []
      syncToLocalStorage([])
      notifyUpdate()
      if (isSupabaseConfigured()) {
        supabase.from(tableName).delete().neq('id', '0').then()
      }
    },

    subscribe(callback: () => void) {
      if (typeof window === 'undefined') return () => {}
      const handler = (e: Event) => {
        const custom = e as CustomEvent<{ key?: string }>
        if (!custom.detail?.key || custom.detail.key === tableName) {
          callback()
        }
      }
      window.addEventListener('lms_store_updated', handler)
      return () => window.removeEventListener('lms_store_updated', handler)
    },
  }
}
