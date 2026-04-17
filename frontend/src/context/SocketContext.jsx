import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";

const SocketContext = createContext(null);

/**
 * SocketProvider:
 * - Creates a Socket.IO connection when the user is authenticated.
 * - Listens for real-time events: receiveMessage, typing, online/offline, read receipts.
 * - Provides the socket instance via context for components that need to emit events.
 */
export const SocketProvider = ({ children }) => {
    const { user } = useAuthStore();
    const { addMessage, updateUserStatus, updateSeenStatus } = useChatStore();
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [typingInfo, setTypingInfo] = useState(null); // { senderName }

    useEffect(() => {
        if (user?._id) {
            // Create socket connection
            const socket = io(
                import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
                { transports: ["websocket", "polling"] }
            );

            socketRef.current = socket;

            // Join personal room
            socket.on("connect", () => {
                setIsConnected(true);
                socket.emit("join", user._id);
            });

            socket.on("disconnect", () => setIsConnected(false));

            // ── Incoming Message ─────────────────────────────
            socket.on("receiveMessage", (message) => {
                addMessage(message);
            });

            // ── Typing Indicator ─────────────────────────────
            socket.on("typing", ({ senderName }) => {
                setTypingInfo({ senderName });
            });

            socket.on("stopTyping", () => {
                setTypingInfo(null);
            });

            // ── Online / Offline Status ───────────────────────
            socket.on("userOnline", ({ userId }) => {
                updateUserStatus(userId, true, null);
            });

            socket.on("userOffline", ({ userId, lastSeen }) => {
                updateUserStatus(userId, false, lastSeen);
            });

            // ── Read Receipts ─────────────────────────────────
            socket.on("messagesSeen", ({ chatId }) => {
                updateSeenStatus(chatId);
            });

            return () => {
                socket.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            };
        }
    }, [user?._id]);

    return (
        <SocketContext.Provider
            value={{ socket: socketRef.current, isConnected, typingInfo, setTypingInfo }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
