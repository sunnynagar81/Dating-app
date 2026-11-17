const Block = require("../models/Block");
const Report = require("../models/Report");
const Match = require("../models/Match");
const User = require("../models/User");

// Block karo aur dono ke beech ka match hata do
const blockPair = async (blockerId, blockedId) => {
  await Block.findOneAndUpdate(
    { blocker: blockerId, blocked: blockedId },
    { blocker: blockerId, blocked: blockedId },
    { upsert: true }
  );
  await Match.deleteMany({
    $or: [
      { user1: blockerId, user2: blockedId },
      { user1: blockedId, user2: blockerId },
    ],
  });
};

// POST /api/safety/report/:userId  (body: { reason, details })
const reportUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot report yourself" });
    }

    const target = await User.findById(userId);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    await Report.create({
      reporter: req.user._id,
      reported: userId,
      reason: req.body.reason,
      details: req.body.details || "",
    });

    await blockPair(req.user._id, userId);

    res.status(201).json({ message: "Report submitted. This user has been blocked." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/safety/block/:userId
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    await blockPair(req.user._id, userId);
    res.json({ message: "User blocked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/safety/block/:userId
const unblockUser = async (req, res) => {
  try {
    await Block.deleteOne({ blocker: req.user._id, blocked: req.params.userId });
    res.json({ message: "User unblocked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/safety/unmatch/:matchId
const unmatch = async (req, res) => {
  try {
    const match = await Match.findOneAndDelete({
      _id: req.params.matchId,
      $or: [{ user1: req.user._id }, { user2: req.user._id }],
    });
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.json({ message: "Unmatched" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { reportUser, blockUser, unblockUser, unmatch };