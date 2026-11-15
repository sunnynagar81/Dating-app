const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    audioFile: { type: String, required: true },
    duration: { type: Number, required: true, min: 1, max: 60 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);