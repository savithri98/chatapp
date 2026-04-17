const mongoose = require("mongoose");

/**
 * Status (Stories) Model
 * Represents a user status update that expires after 24 hours.
 * Supports image and video types.
 */
const statusSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String, // Cloudinary URL
            required: true,
        },
        type: {
            type: String,
            enum: ["image", "video"],
            required: true,
        },
        caption: {
            type: String,
            default: "",
            maxlength: 200,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 60 * 60 * 24, // Automatically delete after 24 hours (86400 seconds)
        },
    },
    { timestamps: true }
);

// Index to efficiently fetch statuses from users whom the current user is "chatting with"
// In our simple app, we'll just show all active statuses to all logged-in users initially.
statusSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Status", statusSchema);
