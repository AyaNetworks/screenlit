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

    removeAttachment: (index) =>
      set((state) => ({
        attachedWorkspaces: state.attachedWorkspaces.filter((_, i) => i !== index),
      })),

    clearAllAttachments: () => set({ attachedWorkspaces: [] }),
  }))
)
