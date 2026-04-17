import { useState, useEffect } from "react";
import Avatar from "./Avatar";

/**
 * StatusViewer — A fullscreen overlay to watch statuses.
 * Includes a progress bar and auto-next functionality.
 */
const StatusViewer = ({ group, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const currentStatus = group.statuses[currentIndex];

    // Duration for each status: 5s for image, video duration for videos
    const DURATION = 5000;

    useEffect(() => {
        setProgress(0);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + (100 / (DURATION / 100));
            });
        }, 100);

        return () => clearInterval(interval);
    }, [currentIndex]);

    const handleNext = () => {
        if (currentIndex < group.statuses.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in">
            {/* Header / Info */}
            <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex gap-1 mb-4">
                    {group.statuses.map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-linear"
                                style={{
                                    width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? "100%" : "0%",
                                }}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar user={group.user} size="md" />
                        <div>
                            <p className="text-white font-medium">{group.user?.name}</p>
                            <p className="text-xs text-gray-300">Status update</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative w-full h-full max-w-lg flex items-center justify-center">
                {currentStatus.type === "video" ? (
                    <video
                        src={currentStatus.content}
                        autoPlay
                        muted
                        className="max-w-full max-h-full"
                        onEnded={handleNext}
                    />
                ) : (
                    <img
                        src={currentStatus.content}
                        alt="Status"
                        className="max-w-full max-h-full object-contain"
                    />
                )}

                {/* Captions */}
                {currentStatus.caption && (
                    <div className="absolute bottom-10 left-0 right-0 p-6 text-center z-10">
                        <p className="text-white text-lg drop-shadow-lg">{currentStatus.caption}</p>
                    </div>
                )}

                {/* Click Areas */}
                <div className="absolute inset-0 flex">
                    <div className="flex-1 cursor-pointer" onClick={handlePrev} />
                    <div className="flex-1 cursor-pointer" onClick={handleNext} />
                </div>
            </div>
        </div>
    );
};

export default StatusViewer;
