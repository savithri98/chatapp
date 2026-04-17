import { create } from "zustand";
import api from "../lib/axios";

/**
 * Zustand store for chat list and active conversation state.
 */
export const useChatStore = create((set, get) => ({
    chats: [],          // All user's chats for the sidebar
    activeChat: null,   // Currently selected chat object
    messages: [],       // Messages for the active chat
    isLoadingChats: false,
    isLoadingMessages: false,

    // Fetch the user's chat list (sidebar)
    fetchChats: async () => {
        set({ isLoadingChats: true });
        try {
            const { data } = await api.get("/chats");
            set({ chats: data.chats, isLoadingChats: false });
        } catch (error) {
            console.error("Failed to fetch chats:", error);
            set({ isLoadingChats: false });
        }
    },

    // Create or open existing chat with a user
    openChat: async (userId) => {
        try {
            const { data } = await api.post("/chats", { userId });
            const chat = data.chat;

            // Add to chats list if not already present
            set((state) => {
                const exists = state.chats.find((c) => c._id === chat._id);
                return {
                    activeChat: chat,
                    chats: exists ? state.chats : [chat, ...state.chats],
                };
            });

            return chat;
        } catch (error) {
            console.error("Failed to open chat:", error);
            return null;
        }
    },

    // Set the active chat directly (when user clicks a chat in sidebar)
    setActiveChat: (chat) => set({ activeChat: chat, messages: [] }),

    // Fetch messages for the active chat
    fetchMessages: async (chatId) => {
        set({ isLoadingMessages: true });
        try {
            const { data } = await api.get(`/messages/${chatId}`);
            set({ messages: data.messages, isLoadingMessages: false });
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            set({ isLoadingMessages: false });
        }
    },

    // Add a new incoming or outgoing message to the messages list
    addMessage: (message) => {
        set((state) => ({
            messages: [...state.messages, message],
        }));

        // Update the lastMessage in the chat list for sidebar preview
        set((state) => ({
            chats: state.chats.map((chat) =>
                chat._id === message.chat
                    ? { ...chat, lastMessage: message, updatedAt: message.createdAt }
                    : chat
            ),
        }));
    },

    // Mark messages in the active chat as seen
    markSeen: async (chatId) => {
        try {
            await api.put(`/messages/seen/${chatId}`);
            // Update seen status in local messages
            set((state) => ({
                messages: state.messages.map((msg) =>
                    msg.chat === chatId && !msg.seen ? { ...msg, seen: true } : msg
                ),
            }));
        } catch (error) {
            console.error("Failed to mark as seen:", error);
        }
    },

    // Update online status for a user across all their chats in the sidebar
    updateUserStatus: (userId, isOnline, lastSeen) => {
        set((state) => ({
            chats: state.chats.map((chat) => ({
                ...chat,
                participants: chat.participants.map((p) =>
                    p._id === userId ? { ...p, isOnline, lastSeen } : p
                ),
            })),
            activeChat: state.activeChat
                ? {
                    ...state.activeChat,
                    participants: state.activeChat.participants.map((p) =>
                        p._id === userId ? { ...p, isOnline, lastSeen } : p
                    ),
                }
                : null,
        }));
    },

    // Mark all sent messages in a chat as seen (read receipt)
    updateSeenStatus: (chatId) => {
        set((state) => ({
            messages: state.messages.map((msg) =>
                msg.chat === chatId ? { ...msg, seen: true } : msg
            ),
        }));
    },

    clearChat: () => set({ activeChat: null, messages: [] }),
}));
