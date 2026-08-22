import { create } from 'zustand'

interface User {
  id: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  fullName: string
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

// Mock User for now
const mockUser: User = {
  id: 'mock-123',
  email: 'admin@school.com',
  role: 'ADMIN',
  fullName: 'Mock Admin'
}

export const useAuthStore = create<AuthState>((set) => ({
  user: mockUser, // Automatically logged in as mock admin for now
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))
