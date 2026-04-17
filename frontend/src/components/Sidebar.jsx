import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import Avatar from "./Avatar";
import api from "../lib/axios";
import { format, isToday } from "date-fns";
import toast from "react-hot-toast";
import StatusSection from "./StatusSection";
import ProfileModal from "./ProfileModal";

/**
 * Format last message time for the chat list preview.
 */
const formatPreviewTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isToday(d) ? format(d, "HH:mm") : format(d, "dd/MM/yy");
};

const Sidebar = ({ onOpenStatus }) => {
    const { user, logout } = useAuthStore();
    const { chats, fetchChats, setActiveChat, openChat, activeChat, isLoadingChats } = useChatStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [activeTab, setActiveTab] = useState("chats"); // "chats" or "status"
    const [showProfile, setShowProfile] = useState(false);

    // Load chat list on mount
    useEffect(() => {
        fetchChats();
    }, []);

    // Search users by name/email when query changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const { data } = await api.get(`/users?q=${encodeURIComponent(searchQuery)}`);
                setSearchResults(data.users);
            } catch (_) { }
            setIsSearching(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelectUser = async (selectedUser) => {
        setSearchQuery("");
        setSearchResults([]);
        setShowSearch(false);
        const chat = await openChat(selectedUser._id);
        if (chat) {
            setActiveChat(chat);
            setActiveTab("chats");
        }
    };

    const handleSelectChat = async (chat) => {
        setActiveChat(chat);
    };

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out");
    };

    // Other participant in a chat
    const getOtherUser = (chat) =>
        chat.participants?.find((p) => p._id !== user?._id);

    return (
        <div className="w-full flex-shrink-0 bg-dark-200 border-r border-white/5 flex flex-col h-full overflow-hidden">
            {/* ── Top Bar / Profile ────────────────────────────────────────── */}
            <div className="bg-dark-100/50 px-4 py-3 flex items-center justify-between">
                <button onClick={() => setShowProfile(true)} className="hover:opacity-80 transition-opacity">
                    <Avatar user={user} size="md" />
                </button>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setActiveTab("status")}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === "status" ? "text-primary-400 bg-white/5" : "text-gray-400 hover:text-white"
                            }`}
                        title="Status"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("chats");
                            setShowSearch((v) => !v);
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showSearch && activeTab === "chats" ? "text-primary-400 bg-white/5" : "text-gray-400 hover:text-white"
                            }`}
                        title="Search users"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Content Area ─────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === "status" ? (
                    <StatusSection onOpenStatus={onOpenStatus} />
                ) : (
                    <>
                        {/* Search Bar */}
                        {showSearch && (
                            <div className="px-3 py-2 animate-fade-in">
                                <div className="relative">
                                    <svg
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search users..."
                                        autoFocus
                                        className="w-full bg-dark-100 text-white text-sm placeholder-gray-500 rounded-full pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="border-b border-white/5 pb-2">
                                <p className="text-xs text-gray-500 px-4 py-2 uppercase tracking-wider font-semibold">Users</p>
                                {searchResults.map((u) => (
                                    <button
                                        key={u._id}
                                        onClick={() => handleSelectUser(u)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                                    >
                                        <Avatar user={u} size="sm" showStatus={true} />
                                        <div>
                                            <p className="text-sm font-medium text-white">{u.name}</p>
                                            <p className="text-xs text-gray-500">{u.email}</p>
                                        </div>
                                    </button>
                                ))}
                                {isSearching && (
                                    <p className="text-xs text-center text-gray-500 py-2">Searching...</p>
                                )}
                            </div>
                        )}

                        {/* Chat List */}
                        <div className="flex flex-col">
                            {isLoadingChats && chats.length === 0 ? (
                                <div className="flex items-center justify-center p-10">
                                    <svg className="animate-spin w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                </div>
                            ) : chats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-10 text-center">
                                    <p className="text-sm text-gray-500">No conversations yet.</p>
                                    <button
                                        onClick={() => setShowSearch(true)}
                                        className="text-xs text-primary-500 mt-2 hover:underline"
                                    >
                                        Start a new chat
                                    </button>
                                </div>
                            ) : (
                                chats.map((chat) => {
                                    const other = getOtherUser(chat);
                                    const isActive = activeChat?._id === chat._id;
                                    const lastMsg = chat.lastMessage;

                                    return (
                                        <button
                                            key={chat._id}
                                            onClick={() => handleSelectChat(chat)}
                                            className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/5 transition-all text-left border-b border-white/5 ${isActive ? "bg-white/10" : ""
                                                }`}
                                        >
                                            <Avatar user={other} size="lg" showStatus={true} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="font-semibold text-[15px] text-white truncate">{other?.name}</span>
                                                    {lastMsg?.createdAt && (
                                                        <span className={`text-[11px] flex-shrink-0 ml-2 ${isActive ? "text-primary-400" : "text-gray-500"}`}>
                                                            {formatPreviewTime(lastMsg.createdAt)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <p className={`text-xs truncate flex-1 ${isActive ? "text-gray-200" : "text-gray-500"}`}>
                                                        {lastMsg
                                                            ? lastMsg.type === "image"
                                                                ? "📷 Photo"
                                                                : lastMsg.type === "video"
                                                                    ? "🎥 Video"
                                                                    : lastMsg.type === "file"
                                                                        ? "📄 Document"
                                                                        : lastMsg.content
                                                            : "No messages yet"}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ── Bottom Tabs ────────────────────────────────────────────────── */}
            <div className="bg-dark-100/50 border-t border-white/5 flex items-center justify-around py-2">
                <button
                    onClick={() => setActiveTab("chats")}
                    className={`flex flex-col items-center gap-1 w-full py-1 transition-colors ${activeTab === "chats" ? "text-primary-500" : "text-gray-500 hover:text-gray-300"
                        }`}
                >
                    <svg className="w-5 h-5" fill={activeTab === "chats" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-[10px] font-medium uppercase tracking-tighter">Chats</span>
                </button>
                <button
                    onClick={() => setActiveTab("status")}
                    className={`flex flex-col items-center gap-1 w-full py-1 transition-colors ${activeTab === "status" ? "text-primary-500" : "text-gray-500 hover:text-gray-300"
                        }`}
                >
                    <svg className="w-5 h-5" fill={activeTab === "status" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[10px] font-medium uppercase tracking-tighter">Status</span>
                </button>
            </div>
            {/* Profile Modal */}
            {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
        </div>
    );
};

export default Sidebar;
