import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SettingsState {
  schoolName: string
  schoolNameBn: string
  tagline: string
  logoUrl: string
  address: string
  phone: string
  email: string
  website: string
  currentSession: string
  sessionStartMonth: number  // 1 = January
  primaryColor: string       // hex
  accentColor: string        // hex

  updateSchoolInfo: (data: Partial<Pick<SettingsState,
    'schoolName' | 'schoolNameBn' | 'tagline' | 'logoUrl' | 'address' | 'phone' | 'email' | 'website'
  >>) => void
  updateSession: (data: Partial<Pick<SettingsState, 'currentSession' | 'sessionStartMonth'>>) => void
  updateAppearance: (data: Partial<Pick<SettingsState, 'primaryColor' | 'accentColor'>>) => void
  resetToDefaults: () => void
}

const DEFAULTS: Omit<SettingsState, 'updateSchoolInfo' | 'updateSession' | 'updateAppearance' | 'resetToDefaults'> = {
  schoolName: 'Panjeree Coaching Center',
  schoolNameBn: 'পাঞ্জেরী কোচিং সেন্টার',
  tagline: 'Excellence in Education',
  logoUrl: '',
  address: 'Mirpur-10, Dhaka-1216, Bangladesh',
  phone: '+880 1700-000000',
  email: 'info@panjeree.edu.bd',
  website: 'www.panjeree.edu.bd',
  currentSession: '2024-25',
  sessionStartMonth: 1,
  primaryColor: '#6366f1',
  accentColor: '#8b5cf6',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      updateSchoolInfo(data) {
        set(state => ({ ...state, ...data }))
      },

      updateSession(data) {
        set(state => ({ ...state, ...data }))
      },

      updateAppearance(data) {
        set(state => ({ ...state, ...data }))
      },

      resetToDefaults() {
        set(state => ({ ...state, ...DEFAULTS }))
      },
    }),
    { name: 'lms-settings' }
  )
)
