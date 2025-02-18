const express = require("express");
const { registerUser, login, getProfile, updateProfile } = require("../controllers/authController"); 
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload")

const router = express.Router();

router.post("/register", upload.single("resume"), registerUser);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;
