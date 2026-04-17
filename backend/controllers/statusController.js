const Status = require("../models/Status");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * @route   POST /api/status
 * @desc    Post a new status (image or video)
 * @access  Protected
 */
const createStatus = async (req, res, next) => {
    try {
        const { caption, type } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No media file provided" });
        }

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "chatapp/statuses",
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });

        const statusType = type || (uploadResult.resource_type === "video" ? "video" : "image");

        const status = await Status.create({
            user: req.user._id,
            content: uploadResult.secure_url,
            type: statusType,
            caption,
        });

        res.status(201).json({ success: true, status });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/status
 * @desc    Get all active statuses from all users (feed)
 * @access  Protected
 */
const getStatusFeed = async (req, res, next) => {
    try {
        // Find all statuses created in the last 24 hours (automatic expiry via TTL is handled by Mongo,
        // but this query ensures we get them grouped by user)
        const statuses = await Status.find()
            .populate("user", "name avatar")
            .sort({ createdAt: -1 });

        // Group statuses by user for the frontend
        const grouped = statuses.reduce((acc, status) => {
            const userId = status.user._id.toString();
            if (!acc[userId]) {
                acc[userId] = {
                    user: status.user,
                    statuses: [],
                };
            }
            acc[userId].statuses.push(status);
            return acc;
        }, {});

        res.status(200).json({ success: true, feed: Object.values(grouped) });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/status/:id
 * @desc    Delete a status
 * @access  Protected
 */
const deleteStatus = async (req, res, next) => {
    try {
        const status = await Status.findById(req.params.id);

        if (!status) {
            return res.status(404).json({ success: false, message: "Status not found" });
        }

        // Only owner can delete
        if (status.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await status.deleteOne();
        res.status(200).json({ success: true, message: "Status deleted" });
    } catch (error) {
        next(error);
    }
};

module.exports = { createStatus, getStatusFeed, deleteStatus };
