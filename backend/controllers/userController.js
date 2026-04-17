const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * @route   GET /api/users
 * @desc    Search all users by name or email (excludes self)
 * @access  Protected
 */
const searchUsers = async (req, res, next) => {
    try {
        const { q } = req.query;

        const filter = {
            _id: { $ne: req.user._id }, // Exclude self
        };

        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
            ];
        }

        const users = await User.find(filter)
            .select("name email avatar isOnline lastSeen")
            .limit(20);

        res.status(200).json({ success: true, users });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get a user's public profile
 * @access  Protected
 */
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select(
            "name email avatar isOnline lastSeen"
        );

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's name and/or avatar
 * @access  Protected
 */
const updateProfile = async (req, res, next) => {
    try {
        const { name } = req.body;
        const updateData = {};

        if (name) updateData.name = name;

        // Upload avatar to Cloudinary if a file was provided
        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "chatapp/avatars",
                        transformation: [{ width: 200, height: 200, crop: "fill" }],
                    },
                    (error, result) => {
                        if (error) {
                            console.error("Cloudinary upload error:", error);
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            });
            updateData.avatar = uploadResult.secure_url;
        }

        const user = await User.findByIdAndUpdate(req.user._id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

module.exports = { searchUsers, getUserById, updateProfile };
