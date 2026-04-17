import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { useSocket } from "../context/SocketContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import Avatar from "./Avatar";
import { format, isToday, isYesterday } from "date-fns";
import api from "../lib/axios";

/**
 * Format a date separator between messages (Today, Yesterday, or full date).
 */
const formatDateSeparator = (dateStr) => {
    const d = new Date(dateStr);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMMM d, yyyy");
};

/**
 * Typing indicator with animated dots.
 */
const TypingIndicator = ({ name }) => (
    <div className="flex items-center gap-2 px-4 py-1 animate-fade-in">
        <div className="bg-dark-100 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
            <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce-dot"
                style={{ animationDelay: "0s" }}
            />
            <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce-dot"
                style={{ animationDelay: "0.2s" }}
            />
            <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce-dot"
                style={{ animationDelay: "0.4s" }}
            />
        </div>
        <span className="text-xs text-gray-500">{name} is typing...</span>
    </div>
);

/**
 * ChatWindow — right panel showing messages for the active chat.
 * Handles:
 * - Fetching messages on chat selection
 * - Marking messages as seen
 * - Auto-scrolling to latest message
 * - Typing indicator
 * - Empty state when no chat is selected
 */
const ChatWindow = () => {
    const { user } = useAuthStore();
    const { activeChat, messages, fetchMessages, markSeen, isLoadingMessages } = useChatStore();
    const { socket, typingInfo } = useSocket();
    const messagesEndRef = useRef(null);

    // The other participant in the chat
    const otherUser = activeChat?.participants?.find(
        (p) => p._id !== user?._id
    );

    // Fetch messages + mark as seen whenever active chat changes
    useEffect(() => {
        if (activeChat?._id) {
            fetchMessages(activeChat._id);
            markSeen(activeChat._id);

            // Tell the sender their messages were seen
            if (socket && otherUser) {
                socket.emit("messagesSeen", {
                    senderId: otherUser._id,
                    chatId: activeChat._id,
                });
            }
        }
    }, [activeChat?._id]);

    // Auto-scroll to the newest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typingInfo]);

    // Empty state — no chat selected
    if (!activeChat) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-dark-300 text-center p-8">
                <div className="w-24 h-24 rounded-full bg-dark-100 flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-300 mb-2">ChatApp</h2>
                <p className="text-gray-500 text-sm max-w-xs">
                    Select a conversation to start chatting, or search for a user to begin a new one.
                </p>
            </div>
        );
    }

    // Group messages by date for date separators
    const groupedMessages = [];
    let lastDate = null;
    messages.forEach((msg) => {
        const msgDate = format(new Date(msg.createdAt), "yyyy-MM-dd");
        if (msgDate !== lastDate) {
            groupedMessages.push({ type: "separator", date: msg.createdAt });
            lastDate = msgDate;
        }
        groupedMessages.push({ type: "message", data: msg });
    });

    return (
        <div className="flex-1 flex flex-col bg-dark-300 overflow-hidden">
            {/* ── Chat Header ─────────────────────────────────────────────────── */}
            <div className="bg-dark-200 border-b border-white/5 px-4 py-3 flex items-center gap-3">
                {/* Back button — only mobile */}
                <button
                    onClick={() => setActiveChat(null)}
                    className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <Avatar user={otherUser} size="md" showStatus={true} />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{otherUser?.name}</h3>
                    <p className="text-xs text-gray-400">
                        {otherUser?.isOnline
                            ? "Online"
                            : otherUser?.lastSeen
                                ? `Last seen ${format(new Date(otherUser.lastSeen), "HH:mm")}`
                                : "Offline"}
                    </p>
                </div>
            </div>

            {/* ── Messages Area ────────────────────────────────────────────────── */}
            <div
                className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5"
                style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.03) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.02) 0%, transparent 50%)`,
                }}
            >
                {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3 text-gray-500">
                            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span className="text-sm">Loading messages...</span>
                        </div>
                    </div>
                ) : groupedMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                            <p className="text-sm">No messages yet.</p>
                            <p className="text-xs mt-1">Say hello! 👋</p>
                        </div>
                    </div>
                ) : (
                    groupedMessages.map((item, idx) =>
                        item.type === "separator" ? (
                            <div key={`sep-${idx}`} className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-white/5" />
                                <span className="text-xs text-gray-500 bg-dark-300 px-3 py-1 rounded-full border border-white/5">
                                    {formatDateSeparator(item.date)}
                                </span>
                                <div className="flex-1 h-px bg-white/5" />
                            </div>
                        ) : (
                            <MessageBubble key={item.data._id} message={item.data} />
                        )
                    )
                )}

                {/* Typing indicator */}
                {typingInfo && <TypingIndicator name={typingInfo.senderName} />}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* ── Message Input ─────────────────────────────────────────────────── */}
            <MessageInput
                chatId={activeChat._id}
                receiverId={otherUser?._id}
                receiver={otherUser}
            />
        </div>
    );
};

export default ChatWindow;
