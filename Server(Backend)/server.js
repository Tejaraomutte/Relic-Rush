require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Mock database for leaderboard
let leaderboard = [
  { email: 'ali@example.com', name: 'Ali', round1Score: 5, round2Score: 4, round3Score: 3, totalScore: 12 },
  { email: 'fatima@example.com', name: 'Fatima', round1Score: 5, round2Score: 5, round3Score: 5, totalScore: 15 },
  { email: 'omar@example.com', name: 'Omar', round1Score: 4, round2Score: 4, round3Score: 4, totalScore: 12 },
  { email: 'aisha@example.com', name: 'Aisha', round1Score: 3, round2Score: 5, round3Score: 4, totalScore: 12 },
  { email: 'hassan@example.com', name: 'Hassan', round1Score: 5, round2Score: 3, round3Score: 2, totalScore: 10 }
];

app.get("/", (req, res) => {
  res.send("Relic Rush Backend Running 🚀");
});

// LOGIN ENDPOINT
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  // Mock authentication - accept any valid email format with password >= 6 chars
  const name = email.split("@")[0];
  res.status(200).json({
    success: true,
    id: email,
    name: name,
    message: "Login successful"
  });
});

// SUBMIT SCORE ENDPOINT
app.post("/submit-score", (req, res) => {
  const { email, round, score } = req.body;
  
  if (!email || !round || score === undefined) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // Find user in leaderboard or create new entry
  let user = leaderboard.find(u => u.email === email);
  if (!user) {
    user = {
      email: email,
      name: email.split("@")[0],
      round1Score: 0,
      round2Score: 0,
      round3Score: 0,
      totalScore: 0
    };
    leaderboard.push(user);
  }

  // Update score based on round
  if (round === 1) user.round1Score = score;
  else if (round === 2) user.round2Score = score;
  else if (round === 3) user.round3Score = score;

  // Calculate total score
  user.totalScore = user.round1Score + user.round2Score + user.round3Score;

  // Sort leaderboard by total score
  leaderboard.sort((a, b) => b.totalScore - a.totalScore);

  res.status(200).json({
    success: true,
    message: `Score for round ${round} submitted successfully`,
    totalScore: user.totalScore
  });
});

// LEADERBOARD ENDPOINT
app.get("/leaderboard", (req, res) => {
  res.status(200).json({
    success: true,
    leaderboard: leaderboard
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
