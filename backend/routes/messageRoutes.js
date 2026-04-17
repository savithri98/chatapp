const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, markSeen } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(protect);

router.post("/", upload.single("file"), sendMessage);
router.get("/:chatId", getMessages);
router.put("/seen/:chatId", markSeen);

module.exports = router;
