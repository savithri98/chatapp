const express = require("express");
const router = express.Router();
const { createStatus, getStatusFeed, deleteStatus } = require("../controllers/statusController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/", protect, upload.single("file"), createStatus);
router.get("/", protect, getStatusFeed);
router.delete("/:id", protect, deleteStatus);

module.exports = router;
