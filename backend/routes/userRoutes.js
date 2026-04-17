const express = require("express");
const router = express.Router();
const { searchUsers, getUserById, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(protect);

router.get("/", searchUsers);
router.put("/profile", upload.single("avatar"), updateProfile);
router.get("/:id", getUserById);

module.exports = router;
