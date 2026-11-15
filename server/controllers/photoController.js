const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Match = require("../models/Match");
const { photoDir } = require("../middleware/photoUploadMiddleware");

// POST /api/photo  (protected, form-data mein "photo" file)
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Photo file is required" });
    }

    // Purani photo delete karo, agar hai
    const oldFile = req.user.photoUrl;
    if (oldFile) {
      const oldPath = path.join(photoDir, oldFile);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // updateOne use kiya taaki password validation na chale
    await User.updateOne({ _id: req.user._id }, { photoUrl: req.file.filename });

    res.status(201).json({ message: "Photo uploaded" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/photo/:userId  (protected)
// Sirf apni photo, ya unlock ho chuki match ki photo
const getPhoto = async (req, res) => {
  try {
    const otherId = req.params.userId;

    if (otherId !== req.user._id.toString()) {
      const match = await Match.findOne({
        $or: [
          { user1: req.user._id, user2: otherId },
          { user1: otherId, user2: req.user._id },
        ],
      });

      if (!match || !match.photoUnlocked) {
        return res.status(403).json({ message: "Photo is not unlocked yet" });
      }
    }

    const user = await User.findById(otherId).select("photoUrl");
    if (!user || !user.photoUrl) {
      return res.status(404).json({ message: "Photo not found" });
    }

    res.sendFile(path.join(photoDir, user.photoUrl));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadPhoto, getPhoto };