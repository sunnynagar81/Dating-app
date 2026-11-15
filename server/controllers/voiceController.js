const VoiceIntro = require("../models/VoiceIntro");

// POST /api/voice  (protected, form-data mein "audio" file aur "duration" field)
const uploadVoiceIntro = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Audio file is required" });
    }

    const duration = Number(req.body.duration);
    if (!duration || duration < 15 || duration > 45) {
      return res.status(400).json({ message: "Voice intro must be between 15 and 45 seconds" });
    }

    // Purana voice intro hata do, agar hai to
    const existing = await VoiceIntro.findOne({ userId: req.user._id });
    if (existing) {
      await VoiceIntro.deleteOne({ _id: existing._id });
    }

    const voiceIntro = await VoiceIntro.create({
      userId: req.user._id,
      audioUrl: `/uploads/${req.file.filename}`,
      duration,
    });

    res.status(201).json({ message: "Voice intro uploaded", voiceIntro });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/voice/me  (protected)
const getMyVoiceIntro = async (req, res) => {
  try {
    const voiceIntro = await VoiceIntro.findOne({ userId: req.user._id });
    if (!voiceIntro) {
      return res.status(404).json({ message: "Voice intro not found" });
    }
    res.json({ voiceIntro });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadVoiceIntro, getMyVoiceIntro };