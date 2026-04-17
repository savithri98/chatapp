const mongoose = require("mongoose");

/**
 * Chat model — represents a 1-to-1 conversation between two users.
 * Stores participants and a reference to the last message for sidebar previews.
 */
const chatSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
    },
    { timestamps: true }
);

// Index for fast participant lookups
chatSchema.index({ participants: 1 });

module.exports = mongoose.model("Chat", chatSchema);
