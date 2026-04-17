import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/axios";

/**
 * Zustand store for authentication state.
 * Persisted to localStorage so user stays logged in on refresh.
 */
export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,

            // Register a new user
            register: async (name, email, password) => {
                set({ isLoading: true });
                try {
                    const { data } = await api.post("/auth/register", {
                        name,
                        email,
                        password,
                    });
                    localStorage.setItem("token", data.token);
                    set({ user: data.user, token: data.token, isLoading: false });
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        message: error.response?.data?.message || "Registration failed",
                    };
                }
            },

            // Login existing user
            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const { data } = await api.post("/auth/login", { email, password });
                    localStorage.setItem("token", data.token);
                    set({ user: data.user, token: data.token, isLoading: false });
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        message: error.response?.data?.message || "Login failed",
                    };
                }
            },

            // Logout — clear state and localStorage
            logout: async () => {
                try {
                    await api.post("/auth/logout");
                } catch (_) { }
                localStorage.removeItem("token");
                set({ user: null, token: null });
            },

            // Update current user's profile (name & avatar)
            updateProfile: async ({ name, avatar }) => {
                const formData = new FormData();
                if (name) formData.append("name", name);
                if (avatar) formData.append("avatar", avatar);

                try {
                    const { data } = await api.put("/users/profile", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                    set({ user: data.user });
                    return { success: true };
                } catch (error) {
                    throw error;
                }
            },

            // Update local user data (e.g., from small updates)
            updateUser: (updatedUser) => {
                set((state) => ({ user: { ...state.user, ...updatedUser } }));
            },
        }),
        {
            name: "chatapp-auth",
            partialize: (state) => ({ user: state.user, token: state.token }),
        }
    )
);
