const User = require("../models/User");
const Message = require("../models/Message");
const Chat = require("../models/Chat");

/**
 * Socket.IO event handler module.
 * Manages all real-time events: messaging, typing, online/offline status, read receipts.
 *
 * Each user joins a personal room named after their userId so we can target them directly.
 */

// Map to track which socket belongs to which user (userId -> socketId)
const onlineUsers = new Map();

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // ─── JOIN USER ROOM ────────────────────────────────────────────────────
        // Called when a user opens the app after login
        socket.on("join", async (userId) => {
            if (!userId) return;

            // Join a personal room identified by userId
            socket.join(userId);
            onlineUsers.set(userId, socket.id);

            // Mark user as online in DB
            await User.findByIdAndUpdate(userId, { isOnline: true });

            // Broadcast to all other users that this user is now online
            socket.broadcast.emit("userOnline", { userId });

            console.log(`👤 User ${userId} joined their room`);
        });

        // ─── SEND MESSAGE ──────────────────────────────────────────────────────
        // Emit message to recipient's personal room for instant delivery
        socket.on("sendMessage", (message) => {
            const { receiver } = message;
            if (receiver) {
                // Emit to receiver's room (their userId)
                io.to(receiver._id || receiver).emit("receiveMessage", message);
            }
        });

        // ─── TYPING INDICATOR ─────────────────────────────────────────────────
        socket.on("typing", ({ receiverId, senderName }) => {
            if (receiverId) {
                io.to(receiverId).emit("typing", { senderName });
            }
        });

        socket.on("stopTyping", ({ receiverId }) => {
            if (receiverId) {
                io.to(receiverId).emit("stopTyping");
            }
        });

        // ─── READ RECEIPTS ────────────────────────────────────────────────────
        // Notify sender that their messages have been read
        socket.on("messagesSeen", ({ senderId, chatId }) => {
            if (senderId) {
                io.to(senderId).emit("messagesSeen", { chatId });
            }
        });

        // ─── DISCONNECT ───────────────────────────────────────────────────────
        socket.on("disconnect", async () => {
            console.log(`❌ Socket disconnected: ${socket.id}`);

            // Find which user owns this socket
            let disconnectedUserId = null;
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    onlineUsers.delete(userId);
                    break;
                }
            }

            if (disconnectedUserId) {
                // Mark user as offline in DB with lastSeen timestamp
                await User.findByIdAndUpdate(disconnectedUserId, {
                    isOnline: false,
                    lastSeen: Date.now(),
                });

                // Broadcast offline status to all connected users
                socket.broadcast.emit("userOffline", {
                    userId: disconnectedUserId,
                    lastSeen: new Date(),
                });
            }
        });
    });
};

module.exports = socketHandler;
