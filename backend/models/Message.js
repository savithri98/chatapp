const mongoose = require("mongoose");

/**
 * Message model — each document is a single message in a chat.
 * Supports text and image types, tracks seen status for read receipts.
 */
const messageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            default: "",
        },
        type: {
            type: String,
            enum: ["text", "image", "video", "file"],
            default: "text",
        },
        fileName: {
            type: String,
            default: "",
        },
        fileSize: {
            type: String,
            default: "",
        },
        seen: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Index for chat-based message lookups (most common query pattern)
messageSchema.index({ chat: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
