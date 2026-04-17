const Message = require("../models/Message");
const Chat = require("../models/Chat");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * @route   POST /api/messages
 * @desc    Send a text or image message
 * @access  Protected
 */
const sendMessage = async (req, res, next) => {
    try {
        const { chatId, receiverId, content, type } = req.body;

        if (!chatId || !receiverId) {
            return res
                .status(400)
                .json({ success: false, message: "chatId and receiverId are required" });
        }

        let messageContent = content;
        let messageType = type || "text";
        let fileName = "";
        let fileSize = "";

        // Handle file upload to Cloudinary (Image, Video, or Raw File)
        if (req.file) {
            fileName = req.file.originalname;
            fileSize = (req.file.size / (1024 * 1024)).toFixed(2) + " MB";

            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "chatapp/messages",
                        resource_type: "auto", // Automatically detect image vs video vs raw
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            });

            messageContent = uploadResult.secure_url;
            // Determine type based on Cloudinary resource_type if not provided
            if (!type) {
                if (uploadResult.resource_type === "image") messageType = "image";
                else if (uploadResult.resource_type === "video") messageType = "video";
                else messageType = "file";
            }
        }

        if (!messageContent) {
            return res
                .status(400)
                .json({ success: false, message: "Message content is required" });
        }

        // Save message to DB
        const message = await Message.create({
            chat: chatId,
            sender: req.user._id,
            receiver: receiverId,
            content: messageContent,
            type: messageType,
            fileName,
            fileSize,
        });

        // Update chat's lastMessage and updatedAt (for sidebar sorting)
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: message._id,
            updatedAt: Date.now(),
        });

        // Populate sender info for frontend rendering
        const populated = await message.populate("sender", "name avatar");

        res.status(201).json({ success: true, message: populated });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/messages/:chatId
 * @desc    Get all messages for a chat (paginated)
 * @access  Protected
 */
const getMessages = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const messages = await Message.find({ chat: chatId })
            .populate("sender", "name avatar")
            .sort({ createdAt: 1 }) // Ascending — oldest first
            .skip(skip)
            .limit(limit);

        const total = await Message.countDocuments({ chat: chatId });

        res.status(200).json({
            success: true,
            messages,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/messages/seen/:chatId
 * @desc    Mark all messages in a chat as seen (for read receipts)
 * @access  Protected
 */
const markSeen = async (req, res, next) => {
    try {
        const { chatId } = req.params;

        // Mark messages sent by others to the current user as seen
        await Message.updateMany(
            { chat: chatId, receiver: req.user._id, seen: false },
            { seen: true }
        );

        res.status(200).json({ success: true, message: "Messages marked as seen" });
    } catch (error) {
        next(error);
    }
};

module.exports = { sendMessage, getMessages, markSeen };
