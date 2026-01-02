import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ChatSession, Message, Attachment, Workspace, ReplyContext, ChatMember } from '../types'
import { apiClient } from '../api/client'
import { useLayoutStore } from './useLayoutStore'
import { useWorkspaceStore } from './useWorkspaceStore'

// Initialize with empty session
const initialChatSessions: ChatSession[] = [
  {
    id: 1,
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
  }
]

interface ChatStoreState {
  // State
  chatSessions: ChatSession[]
  currentChatId: number
  isConnected: boolean

  // Computed (getters)
  getCurrentChat: () => ChatSession | undefined
  getCurrentMessages: () => Message[]

  // Actions
  connectToSession: () => void
  setCurrentChatId: (id: number) => void
  addMessage: (message: Message) => void
  sendMessage: (userMessage: string, attachments?: File[], replyContext?: ReplyContext) => void
  createNewChat: () => void
  deleteChat: (chatId: number) => void
  updateChatTitle: (chatId: number, newTitle: string) => void
  addChatToProject: (chatId: number, projectId: number) => void
  removeChatFromProject: (chatId: number) => void
  addSystemMessage: (userName: string, type: 'join' | 'leave') => void
  addChatMember: (chatId: number, member: ChatMember) => void
  removeChatMember: (chatId: number, memberId: number | string) => void
}

export const useChatStore = create<ChatStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        chatSessions: initialChatSessions,
        currentChatId: 1,
        isConnected: false,

        // Computed (getters)
        getCurrentChat: () => {
          const { chatSessions, currentChatId } = get()
          return chatSessions.find((chat) => chat.id === currentChatId)
        },

        getCurrentMessages: () => {
          const currentChat = get().getCurrentChat()
          return currentChat?.messages || []
        },

        // Actions
        connectToSession: () => {
            if (get().isConnected) return;
            
            apiClient.connectToStream((message: any) => {
                // Handle special message types
                if (message.type === 'layout_update') {
                    useLayoutStore.getState().setLayoutMode(message.mode);
                    useLayoutStore.getState().setSidebarVisible(message.sidebar_visible);
                    return;
                }

                if (message.type === 'artifact_update') {
                    const { action, artifact } = message;
                    if (action === 'create') {
                        let fileType = 'text/markdown';
                        if (artifact.type === 'image') fileType = 'image/png';
                        else if (artifact.type === 'video') fileType = 'video/mp4';
                        else if (artifact.type === 'audio') fileType = 'audio/mpeg';
                        else if (artifact.type === 'csv') fileType = 'text/csv';
                        else if (artifact.type === 'pdf') fileType = 'application/pdf';
                        else if (artifact.type === 'html') fileType = 'text/html';
                        else if (artifact.type === 'code') fileType = 'text/plain'; // Scratchpad handles language detection via extension in fileType or content? No, Scratchpad uses fileType for codeExtensions logic.

                        // Check Scratchpad logic for code:
                        // "const extension = fileType?.split('/')[1]"
                        // so we need 'application/json' or 'text/python'?
                        // Actually Scratchpad defaults to markdown if unknown.

                        if (artifact.type === 'code') fileType = 'application/json'; // Default to something that triggers code view or just let markdown handle it?
                        // Let's use 'text/python' for python code if we can detect it, but we don't know language.
                        // For generic code, 'text/plain' might fall into "Plain text fallback".
                        // Scratchpad checks: codeExtensions.includes(extension) where extension = fileType.split('/')[1].
                        // So 'application/javascript' -> 'javascript'. 'javascript' is in codeExtensions?
                        // codeExtensions = ['json', 'js', 'jsx', 'ts', 'tsx', 'py'...]
                        // So we need 'text/py' or 'application/py'? No, MIME types are usually 'text/x-python'.
                        // Let's just set it to 'text/markdown' for code blocks ``` ``` which is safer,
                        // OR 'application/py' to trigger the specific code view if desired.
                        // But wait, Scratchpad's code view is just <pre><code>. Markdown handles code blocks better with syntax highlighting.
                        // So 'code' type might be best served as 'text/markdown' with content wrapped in ``` ```.
                        // But if the user sends raw code, we want the raw code view.
                        // Let's use 'application/javascript' as a placeholder for code view trigger if we want that.

                        // However, for 'image', 'csv', 'pdf', 'html', we definitely need the mapping.

                        useWorkspaceStore.getState().addArtifact({
                            id: artifact.id,
                            title: artifact.title,
                            content: artifact.content,
                            type: artifact.type,
                            fileType: fileType
                        });
                        // Switch layout to show artifact if needed
                        useLayoutStore.getState().setLayoutMode('artifact_right');
                    } else if (action === 'update') {
                         useWorkspaceStore.getState().updateArtifactContent(artifact.id, artifact.content);
                    }
                    return;
                }

                // Determine message type and format if needed
                // The backend sends Message objects.
                // We need to append it to the current chat.
                // If the message is from AI, we add it.
                // If it's a replacement or update, we might need logic.
                
                // For MVP, just append.
                const newMsg: Message = {
                    role: message.role || 'ai',
                    content: message.content,
                    timestamp: new Date().toISOString(),
                    type: message.type || 'dione',
                    status: message.status || 'success'
                };
                get().addMessage(newMsg);
            });
            set({ isConnected: true });
        },

        setCurrentChatId: (id) => set({ currentChatId: id }),

        addMessage: (message) =>
          set((state) => ({
            chatSessions: state.chatSessions.map((chat) =>
              chat.id === state.currentChatId
                ? { ...chat, messages: [...chat.messages, message] }
                : chat
            ),
          })),

        sendMessage: async (userMessage, attachments = [], replyContext = null) => {
            const newMessage: Message = {
              role: 'user',
              content: userMessage,
              timestamp: new Date().toISOString(),
            }
            
            // Add user message locally immediately
            set((state) => ({
                chatSessions: state.chatSessions.map((chat) =>
                  chat.id === state.currentChatId
                    ? { ...chat, messages: [...chat.messages, newMessage] }
                    : chat
                ),
            }));

            // Send to backend
            try {
                await apiClient.sendMessage({
                    role: 'user',
                    content: userMessage
                });
            } catch (error) {
                console.error("Failed to send message", error);
                // Optionally add error message to chat
            }
        },

        createNewChat: () =>
          set((state) => {
            const newChatId = Math.max(...state.chatSessions.map((c) => c.id)) + 1
            const newChat: ChatSession = {
              id: newChatId,
              title: `New Chat ${newChatId}`,
              messages: [],
              createdAt: new Date().toISOString(),
            }

            return {
              chatSessions: [newChat, ...state.chatSessions],
              currentChatId: newChatId,
            }
          }),

        deleteChat: (chatId) =>
          set((state) => {
            const updatedSessions = state.chatSessions.filter((chat) => chat.id !== chatId)
            let newCurrentChatId = state.currentChatId

            if (chatId === state.currentChatId && updatedSessions.length > 0) {
              newCurrentChatId = updatedSessions[0].id
            }

            return {
              chatSessions: updatedSessions,
              currentChatId: newCurrentChatId,
            }
          }),

        updateChatTitle: (chatId, newTitle) =>
          set((state) => ({
            chatSessions: state.chatSessions.map((chat) =>
              chat.id === chatId ? { ...chat, title: newTitle } : chat
            ),
          })),

        addChatToProject: (chatId, projectId) =>
          set((state) => ({
            chatSessions: state.chatSessions.map((chat) =>
              chat.id === chatId ? { ...chat, projectId } : chat
            ),
          })),

        removeChatFromProject: (chatId) =>
          set((state) => ({
            chatSessions: state.chatSessions.map((chat) =>
              chat.id === chatId ? { ...chat, projectId: undefined } : chat
            ),
          })),

        addSystemMessage: (userName, type) =>
          set((state) => {
            const messageText =
              type === 'join'
                ? `--- ${userName} has joined the chat ---`
                : `--- ${userName} has left the chat ---`

            const systemMessage: Message = {
              role: 'system',
              type,
              content: messageText,
              timestamp: new Date().toISOString(),
              userName,
            }

            return {
              chatSessions: state.chatSessions.map((chat) =>
                chat.id === state.currentChatId
                  ? { ...chat, messages: [...chat.messages, systemMessage] }
                  : chat
              ),
            }
          }),

        addChatMember: (chatId, member) =>
          set((state) => ({
            chatSessions: state.chatSessions.map((chat) => {
              if (chat.id === chatId) {
                const members = chat.members || []
                // Avoid duplicate members
                if (!members.find((m) => m.id === member.id)) {
                  return { ...chat, members: [...members, member] }
                }
              }
              return chat
            }),
          })),

        removeChatMember: (chatId, memberId) =>
          set((state) => ({
            chatSessions: state.chatSessions.map((chat) =>
              chat.id === chatId
                ? { ...chat, members: (chat.members || []).filter((m) => m.id !== memberId) }
                : chat
            ),
          })),
      }),
      {
        name: 'chat-storage', // localStorage key
        version: 7, // Increment version to bust cache
        partialize: (state) => ({
          chatSessions: state.chatSessions,
          currentChatId: state.currentChatId,
        }),
        migrate: (persistedState: any, version: number) => {
            return {
              chatSessions: initialChatSessions,
              currentChatId: 1,
            }
        },
      }
    )
  )
)
