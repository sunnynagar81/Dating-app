const express = require("express");
const {
  reportUser,
  blockUser,
  unblockUser,
  unmatch,
} = require("../controllers/safetyController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/report/:userId", protect, reportUser);
router.post("/block/:userId", protect, blockUser);
router.delete("/block/:userId", protect, unblockUser);
router.post("/unmatch/:matchId", protect, unmatch);

module.exports = router;