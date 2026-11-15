const fs = require("fs");
const path = require("path");
const Match = require("../models/Match");
const Message = require("../models/Message");
const { voiceDir } = require("../middleware/voiceMessageUpload");
const { emitToMatch } = require("../sockets/chatSocket");

const findMatchForUser = (matchId, userId) =>
  Match.findOne({ _id: matchId, $or: [{ user1: userId }, { user2: userId }] });

const removeUploadedFile = (file) => {
  if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
};

// POST /api/match/:id/message  (protected, form-data mein "audio" file aur "duration")
const sendVoiceMessage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Audio file is required" });
    }

    const match = await findMatchForUser(req.params.id, req.user._id);
    if (!match) {
      removeUploadedFile(req.file);
      return res.status(404).json({ message: "Match not found" });
    }

    const duration = Number(req.body.duration);
    if (!duration || duration < 1 || duration > 60) {
      removeUploadedFile(req.file);
      return res.status(400).json({ message: "Duration must be between 1 and 60 seconds" });
    }

    const wasUnlocked = match.photoUnlocked;

    const message = await Message.create({
      matchId: match._id,
      sender: req.user._id,
      audioFile: req.file.filename,
      duration,
    });

    match.voiceMessageCount += 1;
    match.checkUnlock();
    await match.save();

    const payload = {
      id: message._id,
      sender: req.user._id,
      duration,
      createdAt: message.createdAt,
      audioUrl: `/api/match/messages/${message._id}/audio`,
    };
    emitToMatch(match._id.toString(), "new-message", payload);

    if (!wasUnlocked && match.photoUnlocked) {
      emitToMatch(match._id.toString(), "photo-unlocked", { matchId: match._id });
    }

    res.status(201).json({
      message: payload,
      voiceMessageCount: match.voiceMessageCount,
      photoUnlocked: match.photoUnlocked,
    });
  } catch (error) {
    removeUploadedFile(req.file);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/match/:id/messages  (protected)
const getMessages = async (req, res) => {
  try {
    const match = await findMatchForUser(req.params.id, req.user._id);
    if (!match) return res.status(404).json({ message: "Match not found" });

    const messages = await Message.find({ matchId: match._id }).sort({ createdAt: 1 });

    res.json({
      messages: messages.map((m) => ({
        id: m._id,
        sender: m.sender,
        duration: m.duration,
        createdAt: m.createdAt,
        audioUrl: `/api/match/messages/${m._id}/audio`,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/match/messages/:messageId/audio  (protected, sirf match ke users)
const streamAudio = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const match = await findMatchForUser(message.matchId, req.user._id);
    if (!match) return res.status(403).json({ message: "This message is not yours" });

    res.sendFile(path.join(voiceDir, message.audioFile));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendVoiceMessage, getMessages, streamAudio };