const express = require("express");
const { uploadVoiceIntro, getMyVoiceIntro } = require("../controllers/voiceController");
const { protect } = require("../middleware/authMiddleware");
const uploadAudio = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/", protect, uploadAudio.single("audio"), uploadVoiceIntro);
router.get("/me", protect, getMyVoiceIntro);

module.exports = router;