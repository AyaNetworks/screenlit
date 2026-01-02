import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Workspace } from '../types'

// We are migrating scratchpad tabs from local state to this store.
// For now, let's keep the types simple and consistent with what App.jsx uses.

export interface Artifact {
    id: number | string;
    title: string;
    content: string;
    history: string[];
    historyIndex: number;
    type?: string;
    fileType?: string;
    fileName?: string;
    filePath?: string;
}

interface WorkspaceStoreState {
  attachedWorkspaces: Workspace[]
  artifacts: Artifact[]
  currentArtifactId: number | string | null

  attachWorkspace: (workspace: Workspace) => void
  removeAttachment: (index: number) => void
  clearAllAttachments: () => void

  // Artifact Actions
  addArtifact: (artifact: Omit<Artifact, 'history' | 'historyIndex'>) => void
  updateArtifactContent: (id: number | string, content: string) => void
  removeArtifact: (id: number | string) => void
  setCurrentArtifactId: (id: number | string) => void
}

export const useWorkspaceStore = create<WorkspaceStoreState>()(
  devtools((set) => ({
    // State
    attachedWorkspaces: [],
    artifacts: [],
    currentArtifactId: null,

    // Actions
    attachWorkspace: (workspace) =>
      set((state) => ({
        attachedWorkspaces: [...state.attachedWorkspaces, workspace],
      })),

    addArtifact: (artifactData) =>
        set((state) => {
            const newArtifact: Artifact = {
                ...artifactData,
                history: [artifactData.content],
                historyIndex: 0
            };
            return {
                artifacts: [...state.artifacts, newArtifact],
                currentArtifactId: newArtifact.id
            };
        }),

    updateArtifactContent: (id, content) =>
        set((state) => ({
            artifacts: state.artifacts.map(a => {
                if (a.id === id) {
                   const newHistory = [...a.history.slice(0, a.historyIndex + 1), content];
                   return {
                       ...a,
                       content,
                       history: newHistory,
                       historyIndex: newHistory.length - 1
                   };
                }
                return a;
            })
        })),

    setCurrentArtifactId: (id) => set({ currentArtifactId: id }),

    removeArtifact: (id) =>
      set((state) => {
        const newArtifacts = state.artifacts.filter((a) => a.id !== id)
        let newCurrentId = state.currentArtifactId

        if (state.currentArtifactId === id) {
          // If closing active tab, switch to nearest one
          if (newArtifacts.length > 0) {
            // Try to find index of removed tab
            const index = state.artifacts.findIndex((a) => a.id === id)
            // If it was last, take new last (which is index-1). If first, take new first (index 0)
            const newIndex = Math.min(index, newArtifacts.length - 1)
            newCurrentId = newArtifacts[newIndex].id
          } else {
            newCurrentId = null
          }
        }

        return {
            artifacts: newArtifacts,
            currentArtifactId: newCurrentId
        }
      }),

    removeAttachment: (index) =>
      set((state) => ({
        attachedWorkspaces: state.attachedWorkspaces.filter((_, i) => i !== index),
      })),

    clearAllAttachments: () => set({ attachedWorkspaces: [] }),
  }))
)
