import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type LayoutMode = "standard" | "chat_only" | "artifact_right" | "split"

interface LayoutStoreState {
  layoutMode: LayoutMode
  sidebarVisible: boolean

  // Actions
  setLayoutMode: (mode: LayoutMode) => void
  setSidebarVisible: (visible: boolean) => void
}

export const useLayoutStore = create<LayoutStoreState>()(
  devtools(
    (set) => ({
      layoutMode: "standard",
      sidebarVisible: true,

      setLayoutMode: (mode) => set({ layoutMode: mode }),
      setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
    }),
    { name: 'layout-store' }
  )
)
