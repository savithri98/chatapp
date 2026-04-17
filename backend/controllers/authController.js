const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Please provide all fields" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ success: false, message: "Email already registered" });
        }

        // Create user (password hashed via pre-save hook in model)
        const user = await User.create({ name, email, password });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                isOnline: user.isOnline,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Please provide email and password" });
        }

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }

        // Set user online
        user.isOnline = true;
        user.lastSeen = Date.now();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                isOnline: user.isOnline,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user — sets isOnline to false
 * @access  Protected
 */
const logout = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            isOnline: false,
            lastSeen: Date.now(),
        });
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Protected
 */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate with Google ID Token
 * @access  Public
 */
const googleLogin = async (req, res, next) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            // Create user for first-time Google login
            // Password is set to a random string as it's not used for OAuth users
            user = await User.create({
                name,
                email,
                avatar: { url: picture }, // Use Google profile pic
                password: Math.random().toString(36).slice(-16),
            });
        }

        // Set user online
        user.isOnline = true;
        user.lastSeen = Date.now();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Google login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                isOnline: user.isOnline,
            },
        });
    } catch (error) {
        console.error("Google login error:", error);
        res.status(401).json({ success: false, message: "Google authentication failed" });
    }
};

module.exports = { register, login, logout, getMe, googleLogin };
