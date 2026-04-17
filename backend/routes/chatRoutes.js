const express = require("express");
const router = express.Router();
const { createOrGetChat, getMyChats, getChatById } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // All chat routes require authentication

router.route("/").post(createOrGetChat).get(getMyChats);
router.route("/:id").get(getChatById);

module.exports = router;
