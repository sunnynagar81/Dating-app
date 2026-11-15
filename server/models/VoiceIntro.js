const mongoose = require("mongoose");

const voiceIntroSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // har user ka sirf ek voice intro
    },
    audioUrl: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // seconds mein
      required: true,
      min: 15,
      max: 45,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VoiceIntro", voiceIntroSchema);