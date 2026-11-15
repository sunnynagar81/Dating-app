require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const connectDB = require("./config/db");
const { initSocket } = require("./sockets/chatSocket");
const authRoutes = require("./routes/authRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const matchRoutes = require("./routes/matchRoutes");
const photoRoutes = require("./routes/photoRoutes");

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// Sirf voice intros public hain
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Voice dating server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/photo", photoRoutes);

initSocket(server);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});