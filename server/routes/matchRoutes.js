const express = require("express");
const {
  discover,
  connect,
  getMyMatches,
  addCallDuration,
} = require("../controllers/matchController");
const {
  sendVoiceMessage,
  getMessages,
  streamAudio,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const { voiceMessageUpload } = require("../middleware/voiceMessageUpload");

const router = express.Router();

router.get("/discover", protect, discover);
router.post("/connect/:userId", protect, connect);
router.get("/", protect, getMyMatches);
router.post("/:id/call", protect, addCallDuration);

router.post("/:id/message", protect, voiceMessageUpload.single("audio"), sendVoiceMessage);
router.get("/:id/messages", protect, getMessages);
router.get("/messages/:messageId/audio", protect, streamAudio);

module.exports = router;