import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastItem {
  id: string
  title?: string
  message: string
  type: ToastType
  duration?: number // ms, default 3800
  action?: ToastAction
}

interface ToastState {
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => string
  removeToast: (id: string) => void
  clearAll: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((state) => ({
      // Keep up to 4 most recent toasts
      toasts: [...state.toasts.slice(-3), { ...toast, id }],
    }))
    return id
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearAll: () => set({ toasts: [] }),
}))

export interface ToastOptions {
  title?: string
  duration?: number
  action?: ToastAction
}

/**
 * Universal toast dispatcher that can be called anywhere (components, hooks, event handlers, utils)
 */
export const toast = {
  success: (message: string, options?: ToastOptions) =>
    useToastStore.getState().addToast({ type: 'success', message, ...options }),
  error: (message: string, options?: ToastOptions) =>
    useToastStore.getState().addToast({ type: 'error', message, ...options }),
  warning: (message: string, options?: ToastOptions) =>
    useToastStore.getState().addToast({ type: 'warning', message, ...options }),
  info: (message: string, options?: ToastOptions) =>
    useToastStore.getState().addToast({ type: 'info', message, ...options }),
  dismiss: (id: string) => useToastStore.getState().removeToast(id),
  clear: () => useToastStore.getState().clearAll(),
}

export function useToast() {
  const { toasts, removeToast, clearAll } = useToastStore()
  return {
    toasts,
    toast,
    dismiss: removeToast,
    clearAll,
  }
}
