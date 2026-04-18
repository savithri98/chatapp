import { useState, useRef, useCallback, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { useSocket } from "../context/SocketContext";
import api from "../lib/axios";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

/**
 * MessageInput — text input + image upload button + emoji picker at the bottom of the chat window.
 * Emits typing events via socket while the user is typing.
 */
const MessageInput = ({ chatId, receiverId, receiver }) => {
    const { user } = useAuthStore();
    const { addMessage } = useChatStore();
    const { socket } = useSocket();
    const [text, setText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileRef = useRef(null);
    const typingTimer = useRef(null);
    const emojiPickerRef = useRef(null);
    const textAreaRef = useRef(null);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Emit typing / stopTyping socket events with debounce
    const handleTyping = useCallback(
        (value) => {
            if (!socket || !receiverId) return;
            if (value) {
                socket.emit("typing", { receiverId, senderName: user?.name });
                clearTimeout(typingTimer.current);
                typingTimer.current = setTimeout(() => {
                    socket.emit("stopTyping", { receiverId });
                }, 1500);
            } else {
                clearTimeout(typingTimer.current);
                socket.emit("stopTyping", { receiverId });
            }
        },
        [socket, receiverId, user?.name]
    );

    const handleTextChange = (e) => {
        setText(e.target.value);
        handleTyping(e.target.value);
    };

    const handleEmojiClick = (emojiData) => {
        setText((prev) => prev + emojiData.emoji);
        // refocus the textarea after picking an emoji
        textAreaRef.current?.focus();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        if (file.type.startsWith("image/")) {
            setFilePreview(URL.createObjectURL(file));
        } else {
            setFilePreview("file"); // Marker for non-image files
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const sendMessage = async () => {
        if ((!text.trim() && !selectedFile) || isSending) return;

        // Stop typing indicator
        if (socket) socket.emit("stopTyping", { receiverId });
        clearTimeout(typingTimer.current);
        setShowEmojiPicker(false);

        setIsSending(true);
        try {
            const formData = new FormData();
            formData.append("chatId", chatId);
            formData.append("receiverId", receiverId);

            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            if (text.trim()) {
                formData.append("content", text.trim());
            }

            const { data } = await api.post("/messages", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const message = data.message;
            addMessage(message);

            if (socket) {
                socket.emit("sendMessage", { ...message, receiver: receiverId });
            }

            setText("");
            clearFile();
        } catch (error) {
            toast.error("Failed to send message");
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="bg-dark-200 border-t border-white/5 px-4 py-3 relative">
            {/* Emoji Picker Overlay */}
            {showEmojiPicker && (
                <div
                    ref={emojiPickerRef}
                    className="absolute bottom-full left-4 mb-2 z-50 shadow-2xl animate-fade-in"
                >
                    <EmojiPicker
                        theme="dark"
                        onEmojiClick={handleEmojiClick}
                        lazyLoadEmojis={true}
                        searchDisabled={false}
                        skinTonesDisabled={true}
                        width={300}
                        height={400}
                    />
                </div>
            )}

            {/* File preview */}
            {filePreview && (
                <div className="mb-2 relative inline-flex items-center gap-3 bg-dark-100 p-2 rounded-xl border border-white/10 animate-fade-in">
                    {filePreview === "file" ? (
                        <div className="w-12 h-12 rounded-lg bg-primary-600/20 flex items-center justify-center text-primary-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    ) : (
                        <img
                            src={filePreview}
                            alt="Preview"
                            className="h-12 w-12 rounded-lg object-cover"
                        />
                    )}
                    <div className="flex-1 min-w-0 pr-6">
                        <p className="text-xs text-gray-300 truncate">{selectedFile?.name}</p>
                        <p className="text-[10px] text-gray-500">{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                        onClick={clearFile}
                        className="absolute top-1 right-1 bg-white/5 hover:bg-white/10 text-gray-400 rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="flex items-end gap-3">
                {/* Emoji Toggle Button */}
                <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showEmojiPicker ? 'bg-primary-600 text-white' : 'bg-dark-100 text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                    title="Emojis"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>

                {/* File upload button */}
                <button
                    onClick={() => fileRef.current?.click()}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-dark-100 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    title="Attach file"
                >
                    <svg className="w-5 h-5 focus:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Text input */}
                <textarea
                    ref={textAreaRef}
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 bg-dark-100 text-white placeholder-gray-500 rounded-2xl px-4 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-sm max-h-32 overflow-y-auto"
                    style={{ lineHeight: "1.5" }}
                />

                {/* Send button */}
                <button
                    onClick={sendMessage}
                    disabled={(!text.trim() && !selectedFile) || isSending}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all active:scale-95"
                >
                    {isSending ? (
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};
export default MessageInput;
