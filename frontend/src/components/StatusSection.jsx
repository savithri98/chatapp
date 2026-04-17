import { useState, useEffect } from "react";
import { useStatusStore } from "../store/statusStore";
import { useAuthStore } from "../store/authStore";
import Avatar from "./Avatar";
import { formatDistanceToNow } from "date-fns";

/**
 * StatusSection — The tab in the sidebar where users see and post statuses.
 */
const StatusSection = ({ onOpenStatus }) => {
    const { feed, fetchFeed, postStatus, isLoading } = useStatusStore();
    const { user } = useAuthStore();
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchFeed();
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const type = file.type.startsWith("video/") ? "video" : "image";
            await postStatus(file, "", type);
        } finally {
            setIsUploading(false);
        }
    };

    // My statuses (if any)
    const myStatusGroup = feed.find((f) => f.user?._id === user?._id);
    const otherStatuses = feed.filter((f) => f.user?._id !== user?._id);

    return (
        <div className="flex flex-col h-full bg-dark-300">
            {/* Header */}
            <div className="p-4 bg-dark-200/50 flex items-center justify-between border-b border-white/5">
                <h2 className="text-xl font-bold text-white">Status</h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                {/* My Status */}
                <div>
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4 px-1">My Status</h3>
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="relative">
                            <div className={`w-14 h-14 rounded-full p-0.5 border-2 ${myStatusGroup ? "border-primary-500" : "border-dashed border-gray-600"
                                }`}>
                                <Avatar user={user} size="full" />
                            </div>
                            <label className="absolute bottom-0 right-0 w-5 h-5 bg-primary-600 rounded-full border-2 border-dark-300 flex items-center justify-center text-white cursor-pointer hover:bg-primary-500 transition-colors">
                                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} disabled={isUploading} />
                                <span className="text-lg font-bold leading-none">+</span>
                            </label>
                        </div>
                        <div className="flex-1" onClick={() => myStatusGroup && onOpenStatus(myStatusGroup)}>
                            <p className="text-white font-medium">My Status</p>
                            <p className="text-xs text-gray-500">
                                {myStatusGroup
                                    ? `Last update ${formatDistanceToNow(new Date(myStatusGroup.statuses[0].createdAt))} ago`
                                    : "Tap to add status update"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recent Updates */}
                {otherStatuses.length > 0 && (
                    <div>
                        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4 px-1">Recent Updates</h3>
                        <div className="space-y-4">
                            {otherStatuses.map((group) => (
                                <div
                                    key={group.user?._id}
                                    className="flex items-center gap-4 cursor-pointer group"
                                    onClick={() => onOpenStatus(group)}
                                >
                                    <div className="w-14 h-14 rounded-full p-0.5 border-2 border-primary-500">
                                        <Avatar user={group.user} size="full" />
                                    </div>
                                    <div className="flex-1 border-b border-white/5 pb-4 group-last:border-none">
                                        <p className="text-white font-medium">{group.user?.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(group.statuses[0].createdAt))} ago
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!isLoading && feed.length === 0 && (
                    <div className="flex flex-col items-center justify-center pt-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-dark-100 flex items-center justify-center text-gray-600 mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-gray-400 text-sm">No status updates yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusSection;
