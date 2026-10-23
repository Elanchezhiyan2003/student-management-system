
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const frontendUrl = process.env.CLIENT_URL || "https://student-management-system-ruddy-five.vercel.app/";

app.get("/", (req, res) => {
  res.send("Student Management System API is running!");
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (origin === frontendUrl) return callback(null, true);

      try {
        const url = new URL(origin);
        const isLocalFrontend =
          url.protocol === "http:" &&
          (url.hostname === "localhost" || url.hostname === "127.0.0.1");
        callback(null, isLocalFrontend);
      } catch {
        callback(new Error("Invalid request origin"));
      }
    },
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    message: "Student Management API is running",
    database: databaseConnected ? "connected" : "disconnected",
  });
});

app.use("/api/students", studentRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing from .env; database routes are unavailable");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

startServer();
