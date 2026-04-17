import { create } from "zustand";
import api from "../lib/axios";
import toast from "react-hot-toast";

/**
 * useStatusStore — manages the global state for WhatsApp-like statuses (stories).
 * Handles fetching the feed and posting new statuses.
 */
export const useStatusStore = create((set, get) => ({
    feed: [], // Array of { user, statuses: [] }
    isLoading: false,

    fetchFeed: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get("/status");
            set({ feed: data.feed });
        } catch (error) {
            console.error("Failed to fetch status feed", error);
        } finally {
            set({ isLoading: false });
        }
    },

    postStatus: async (file, caption, type) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("caption", caption);
            formData.append("type", type);

            const { data } = await api.post("/status", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Status posted!");
            get().fetchFeed(); // Refresh feed
            return data.status;
        } catch (error) {
            toast.error("Failed to post status");
            throw error;
        }
    },
}));
