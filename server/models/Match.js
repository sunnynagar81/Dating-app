const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    user1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    voiceMessageCount: { type: Number, default: 0 },
    callDurationSeconds: { type: Number, default: 0 },
    photoUnlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Unlock condition: 3 minute ki call ya 5 voice messages
matchSchema.methods.checkUnlock = function () {
  if (this.callDurationSeconds >= 180 || this.voiceMessageCount >= 5) {
    this.photoUnlocked = true;
  }
  return this.photoUnlocked;
};

module.exports = mongoose.model("Match", matchSchema);