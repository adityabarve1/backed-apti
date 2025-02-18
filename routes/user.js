const express = require("express");
const { getUserProfile, updateUserProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", authMiddleware, getUserProfile);
router.put("/update-profile", authMiddleware, updateUserProfile); // Fixed function reference

module.exports = router;
