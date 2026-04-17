import { format, isToday, isYesterday } from "date-fns";
import { useAuthStore } from "../store/authStore";

/**
 * Format a message timestamp for display in the message bubble.
 */
const formatTime = (dateStr) => format(new Date(dateStr), "HH:mm");

/**
 * Read receipt icons:
 * - Single grey tick: sent
 * - Double grey tick: delivered (we treat all messages as delivered)
 * - Double blue tick: seen
 */
const ReadReceipt = ({ seen }) => (
    <span className={`ml-1 ${seen ? "text-blue-400" : "text-gray-400"}`}>
        {seen ? (
            // Double tick
            <svg className="inline w-4 h-4" viewBox="0 0 16 11" fill="currentColor">
                <path d="M11.071.653a.75.75 0 0 1 .031 1.06l-6 6.5a.75.75 0 0 1-1.091 0l-3-3.25A.75.75 0 1 1 2.09 3.987L5 7.146l5.484-5.947a.75.75 0 0 1 1.06-.03z" />
                <path d="M14.571.653a.75.75 0 0 1 .031 1.06l-6 6.5a.75.75 0 0 1-1.06.031L14.571.653z" />
                <path d="M8.571.653a.75.75 0 0 1 .031 1.06l-6 6.5a.75.75 0 0 1-1.091 0l-3-3.25A.75.75 0 1 1-.0.987L3 4.146l5.484-5.947a.75.75 0 0 1 1.06-.03z" />
            </svg>
        ) : (
            // Single tick
            <svg className="inline w-3.5 h-3.5" viewBox="0 0 16 11" fill="currentColor">
                <path d="M11.071.653a.75.75 0 0 1 .031 1.06l-6 6.5a.75.75 0 0 1-1.091 0l-3-3.25A.75.75 0 1 1 2.09 3.987L5 7.146l5.484-5.947a.75.75 0 0 1 1.06-.03z" />
            </svg>
        )}
    </span>
);

/**
 * MessageBubble — renders a single chat message.
 * - Sent messages align right with green background.
 * - Received messages align left with dark background.
 */
const MessageBubble = ({ message, showAvatar = false }) => {
    const { user } = useAuthStore();
    const isSent = message.sender?._id === user?._id || message.sender === user?._id;

    return (
        <div
            className={`flex items-end gap-2 mb-1 animate-fade-in ${isSent ? "flex-row-reverse" : "flex-row"
                }`}
        >
            <div
                className={`max-w-[70%] px-3 py-2 rounded-2xl shadow-sm ${isSent
                    ? "bg-primary-700 text-white rounded-br-sm"
                    : "bg-dark-100 text-gray-100 rounded-bl-sm"
                    }`}
            >
                {/* Media Content */}
                {message.type === "image" && (
                    <a href={message.content} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl">
                        <img
                            src={message.content}
                            alt="Shared"
                            className="max-w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-300"
                        />
                    </a>
                )}

                {message.type === "video" && (
                    <div className="overflow-hidden rounded-xl bg-black/20">
                        <video
                            src={message.content}
                            controls
                            className="max-w-full h-auto block"
                        />
                    </div>
                )}

                {message.type === "file" && (
                    <a
                        href={message.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-3 rounded-xl hover:bg-black/10 transition-colors ${isSent ? "bg-white/10" : "bg-white/5"
                            }`}
                    >
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-500/20 text-primary-400 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {message.fileName || "Document"}
                            </p>
                            <p className="text-[10px] opacity-60">
                                {message.fileSize || "File"}
                            </p>
                        </div>
                    </a>
                )}

                {/* Text Content */}
                {message.type === "text" && (
                    <p className="text-sm leading-relaxed break-words px-1">{message.content}</p>
                )}

                {/* Timestamp + read receipt row */}
                <div
                    className={`flex items-center gap-1 mt-1 ${isSent ? "justify-end" : "justify-start"
                        }`}
                >
                    <span className="text-[10px] text-gray-300/70">
                        {formatTime(message.createdAt)}
                    </span>
                    {isSent && <ReadReceipt seen={message.seen} />}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
