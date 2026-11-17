const User = require("../models/User");
const VoiceIntro = require("../models/VoiceIntro");
const Match = require("../models/Match");
const { getBlockedUserIds } = require("../utils/blockUtils");

// Ek user ka public data, photo tabhi jab unlock ho
const publicProfile = (user, match) => ({
  id: user._id,
  name: user.name,
  age: user.age,
  gender: user.gender,
  bio: user.bio,
  photoUnlocked: match ? match.photoUnlocked : false,
  photoUrl:
    match && match.photoUnlocked && user.photoUrl ? `/api/photo/${user._id}` : null,
});

// GET /api/match/discover
const discover = async (req, res) => {
  try {
    const blockedIds = await getBlockedUserIds(req.user._id);

    const intros = await VoiceIntro.find({
      userId: { $nin: [req.user._id, ...blockedIds] },
    }).limit(20);

    const userIds = intros.map((i) => i.userId);
    const users = await User.find({ _id: { $in: userIds } });

    const result = users.map((user) => {
      const intro = intros.find((i) => i.userId.equals(user._id));
      return { ...publicProfile(user, null), voiceIntroUrl: intro.audioUrl };
    });

    res.json({ users: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/match/connect/:userId
const connect = async (req, res) => {
  try {
    const otherId = req.params.userId;
    if (otherId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot connect with yourself" });
    }

    const blockedIds = await getBlockedUserIds(req.user._id);
    if (blockedIds.includes(otherId)) {
      return res.status(404).json({ message: "User not found" });
    }

    let match = await Match.findOne({
      $or: [
        { user1: req.user._id, user2: otherId },
        { user1: otherId, user2: req.user._id },
      ],
    });

    if (!match) {
      match = await Match.create({ user1: req.user._id, user2: otherId });
    }

    res.status(201).json({ message: "Match created", match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/match  (meri saari matches)
const getMyMatches = async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [{ user1: req.user._id }, { user2: req.user._id }],
    });

    const result = await Promise.all(
      matches.map(async (match) => {
        const otherId = match.user1.equals(req.user._id) ? match.user2 : match.user1;
        const other = await User.findById(otherId);
        return { matchId: match._id, ...publicProfile(other, match) };
      })
    );

    res.json({ matches: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/match/:id/call  (body mein { "duration": 200 })
const addCallDuration = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });

    const duration = Number(req.body.duration);
    if (!duration || duration <= 0) {
      return res.status(400).json({ message: "Send a valid duration" });
    }

    match.callDurationSeconds = Math.max(match.callDurationSeconds, duration);
    match.checkUnlock();
    await match.save();

    res.json({ callDurationSeconds: match.callDurationSeconds, photoUnlocked: match.photoUnlocked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { discover, connect, getMyMatches, addCallDuration };