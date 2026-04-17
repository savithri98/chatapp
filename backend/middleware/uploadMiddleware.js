const multer = require("multer");

// Store file in memory buffer so we can stream to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Basic filter — basically allow anything common for now, 
    // Cloudinary will do the final verification.
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max for videos/docs
});

module.exports = upload;
