import { create } from 'zustand'

type AppState = {
  language: string
  profile: any
  setLanguage: (lang: string) => void
  setProfile: (profile: any) => void
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  profile: null,

  setLanguage: (lang) => set({ language: lang }),
  setProfile: (profile) => set({ profile }),
}))