import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AdminProfile {
  fullName: string
  email: string
  phone: string
  role: string
  avatarUrl: string
  lastLogin: string
}

export interface ProfileState extends AdminProfile {
  updateProfile: (data: Partial<Omit<ProfileState, 'updateProfile' | 'changePassword' | 'activityLog'>>) => void
  changePassword: (current: string, newPass: string) => boolean
  activityLog: ActivityEntry[]
  addActivity: (action: string) => void
}

export interface ActivityEntry {
  id: string
  action: string
  timestamp: string
}

const DEFAULTS: AdminProfile = {
  fullName: 'Admin User',
  email: 'admin@panjeree.edu.bd',
  phone: '+880 1700-000000',
  role: 'Super Admin',
  avatarUrl: '',
  lastLogin: new Date().toISOString(),
}

// Stored hashed password (plain for mock — never do this in prod)
let _mockPassword = 'admin123'

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      activityLog: [
        { id: '1', action: 'Logged in', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', action: 'Added new student: Rahim Uddin', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: '3', action: 'Published exam results: Half-Yearly 2024', timestamp: new Date(Date.now() - 86400000).toISOString() },
        { id: '4', action: 'Collected payment from Sadia Islam', timestamp: new Date(Date.now() - 172800000).toISOString() },
      ],

      updateProfile(data) {
        set(state => ({ ...state, ...data }))
        get().addActivity(`Updated profile: ${Object.keys(data).join(', ')}`)
      },

      changePassword(current, newPass) {
        if (current !== _mockPassword) return false
        _mockPassword = newPass
        get().addActivity('Changed password')
        return true
      },

      addActivity(action) {
        set(state => ({
          activityLog: [
            { id: crypto.randomUUID(), action, timestamp: new Date().toISOString() },
            ...state.activityLog,
          ].slice(0, 50), // keep last 50
        }))
      },
    }),
    { name: 'lms-profile' }
  )
)
