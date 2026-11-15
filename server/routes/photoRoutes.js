const express = require("express");
const { uploadPhoto, getPhoto } = require("../controllers/photoController");
const { protect } = require("../middleware/authMiddleware");
const { uploadPhoto: photoMulter } = require("../middleware/photoUploadMiddleware");

const router = express.Router();

router.post("/", protect, photoMulter.single("photo"), uploadPhoto);
router.get("/:userId", protect, getPhoto);

module.exports = router;