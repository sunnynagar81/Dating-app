const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reported: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: {
      type: String,
      enum: ["harassment", "inappropriate_content", "fake_profile", "spam", "other"],
      required: true,
    },
    details: { type: String, maxlength: 500, default: "" },
    status: {
      type: String,
      enum: ["open", "reviewed", "actioned"],
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);