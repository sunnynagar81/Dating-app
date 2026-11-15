const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, phone, password, age, gender, bio } = req.body;

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: "This phone number is already registered" });
    }

    const user = await User.create({ name, phone, password, age, gender, bio });

    res.status(201).json({
      message: "Registration successful",
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, phone: user.phone, verified: user.verified },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password are required" });
    }

    // password select:false hai, isliye yahan explicitly laana padega
    const user = await User.findOne({ phone }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Incorrect phone or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect phone or password" });
    }

    res.json({
      message: "Login successful",
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, phone: user.phone, verified: user.verified },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };