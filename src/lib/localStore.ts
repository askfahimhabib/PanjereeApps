/**
 * localStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * A lightweight localStorage-backed data store for offline/dev use.
 * Acts as a drop-in for Supabase queries — swap the implementation later.
 *
 * Usage:
 *   const store = createStore<Routine>('routines')
 *   store.getAll()                    // → Routine[]
 *   store.getWhere(r => r.class_id === id)  // → Routine[]
 *   store.insert(newItem)             // → Routine
 *   store.update(id, partial)         // → Routine
 *   store.remove(id)                  // → void
 *   store.seed(items)                 // seed if empty (runs once)
 */

export interface Store<T extends { id: string }> {
  getAll: () => T[]
  getWhere: (predicate: (item: T) => boolean) => T[]
  getOne: (id: string) => T | undefined
  insert: (item: T) => T
  update: (id: string, partial: Partial<T>) => T
  remove: (id: string) => void
  seed: (items: T[]) => void
  clear: () => void
}

export function createStore<T extends { id: string }>(key: string): Store<T> {
  const storageKey = `lms_store_${key}`

  function readAll(): T[] {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? (JSON.parse(raw) as T[]) : []
    } catch {
      return []
    }
  }

  function writeAll(items: T[]): void {
    localStorage.setItem(storageKey, JSON.stringify(items))
  }

  return {
    getAll() {
      return readAll()
    },

    getWhere(predicate) {
      return readAll().filter(predicate)
    },

    getOne(id) {
      return readAll().find((item) => item.id === id)
    },

    insert(item) {
      const items = readAll()
      items.push(item)
      writeAll(items)
      return item
    },

    update(id, partial) {
      const items = readAll()
      const index = items.findIndex((item) => item.id === id)
      if (index === -1) throw new Error(`[localStore:${key}] Item not found: ${id}`)
      const updated = { ...items[index], ...partial } as T
      items[index] = updated
      writeAll(items)
      return updated
    },

    remove(id) {
      const items = readAll().filter((item) => item.id !== id)
      writeAll(items)
    },

    /** Seed with initial data — only runs if store is currently empty */
    seed(items) {
      if (readAll().length === 0) {
        writeAll(items)
      }
    },

    clear() {
      localStorage.removeItem(storageKey)
    },
  }
}
