import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type LayoutMode = "standard" | "chat_only" | "artifact_right" | "split"

interface LayoutStoreState {
  layoutMode: LayoutMode
  sidebarVisible: boolean
  headerTitle: string
  headerSubtitle: string

  // Actions
  setLayoutMode: (mode: LayoutMode) => void
  setSidebarVisible: (visible: boolean) => void
  setHeader: (title: string, subtitle: string) => void
}

export const useLayoutStore = create<LayoutStoreState>()(
  devtools(
    (set) => ({
      layoutMode: "standard",
      sidebarVisible: true,
      headerTitle: "Dione Workspaces",
      headerSubtitle: "An AI driven operational platform by Eisuke Izawa.",

      setLayoutMode: (mode) => set({ layoutMode: mode }),
      setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
      setHeader: (title, subtitle) => set({ headerTitle: title, headerSubtitle: subtitle }),
    }),
    { name: 'layout-store' }
  )
)
