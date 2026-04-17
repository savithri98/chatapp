const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");

/**
 * @route   POST /api/chats
 * @desc    Create or get existing 1-to-1 chat between two users
 * @access  Protected
 */
const createOrGetChat = async (req, res, next) => {
    try {
        const { userId } = req.body; // The other user's ID

        if (!userId) {
            return res
                .status(400)
                .json({ success: false, message: "Please provide userId" });
        }

        if (userId === req.user._id.toString()) {
            return res
                .status(400)
                .json({ success: false, message: "Cannot chat with yourself" });
        }

        // Check if chat already exists between these two users
        let chat = await Chat.findOne({
            participants: { $all: [req.user._id, userId] },
        })
            .populate("participants", "-password")
            .populate({
                path: "lastMessage",
                populate: { path: "sender", select: "name avatar" },
            });

        if (!chat) {
            // Create new chat
            chat = await Chat.create({ participants: [req.user._id, userId] });
            chat = await chat.populate("participants", "-password");
        }

        res.status(200).json({ success: true, chat });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/chats
 * @desc    Get all chats for the authenticated user (for sidebar)
 * @access  Protected
 */
const getMyChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id,
        })
            .populate("participants", "name avatar isOnline lastSeen")
            .populate({
                path: "lastMessage",
                populate: { path: "sender", select: "name" },
            })
            .sort({ updatedAt: -1 }); // Most recent conversations first

        res.status(200).json({ success: true, chats });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/chats/:id
 * @desc    Get a single chat by ID
 * @access  Protected
 */
const getChatById = async (req, res, next) => {
    try {
        const chat = await Chat.findById(req.params.id)
            .populate("participants", "name avatar isOnline lastSeen")
            .populate({
                path: "lastMessage",
                populate: { path: "sender", select: "name" },
            });

        if (!chat) {
            return res
                .status(404)
                .json({ success: false, message: "Chat not found" });
        }

        // Verify user is a participant
        const isParticipant = chat.participants.some(
            (p) => p._id.toString() === req.user._id.toString()
        );
        if (!isParticipant) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        res.status(200).json({ success: true, chat });
    } catch (error) {
        next(error);
    }
};

module.exports = { createOrGetChat, getMyChats, getChatById };
