import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import StatusViewer from "../components/StatusViewer";
import { useChatStore } from "../store/chatStore";

/**
 * Home page — the main WhatsApp-like layout.
 * Optimized for mobile: Shows either Sidebar or ChatWindow depending on selection.
 */
const Home = () => {
    const { activeChat } = useChatStore();
    const [viewingStatusGroup, setViewingStatusGroup] = useState(null);

    return (
        <div className="flex h-screen overflow-hidden bg-dark-300">
            {/* Sidebar: hidden on mobile if a chat is active */}
            <div
                className={`${activeChat ? "hidden md:flex" : "flex"
                    } w-full md:w-[380px] lg:w-[420px] flex-shrink-0 border-r border-white/5 transition-all duration-300`}
            >
                <Sidebar onOpenStatus={setViewingStatusGroup} />
            </div>

            {/* ChatWindow: full screen on mobile if active, hidden if not */}
            <div
                className={`${!activeChat ? "hidden md:flex" : "flex"
                    } flex-1 overflow-hidden transition-all duration-300`}
            >
                <ChatWindow />
            </div>

            {/* Status Viewer Overlay */}
            {viewingStatusGroup && (
                <StatusViewer
                    group={viewingStatusGroup}
                    onClose={() => setViewingStatusGroup(null)}
                />
            )}
        </div>
    );
};

export default Home;
