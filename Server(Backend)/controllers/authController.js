const User = require("../models/user");
const jwt = require("jsonwebtoken");

/* ================= TOKEN ================= */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });
};

/* ================= REGISTER ================= */
const registerUser = async (req, res) => {
  try {
    const { teamName, password } = req.body;

    if (!teamName || !password) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

    const userExists = await User.findOne({ teamName });

    if (userExists) {
      return res.status(400).json({
        message: "Team already exists"
      });
    }

    const user = await User.create({
      teamName,
      password
    });

    res.status(201).json({
      _id: user._id,
      teamName: user.teamName,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* ================= LOGIN ================= */
const loginUser = async (req, res) => {
  try {

    console.log("LOGIN BODY:", req.body);

    const teamName = req.body.teamName.trim();
    const password = req.body.password.trim();

    const user = await User.findOne({ teamName });

    console.log("DB USER:", user);
    console.log("ENTERED PASSWORD:", password);

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    if (user.password !== password) {
      console.log("PASSWORD NOT MATCHING");
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    res.json({
      teamName: user.teamName
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
/* ================= LEADERBOARD ================= */
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ totalScore: -1 })
      .select("-password");

    res.json({
      success: true,
      leaderboard: users
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* ================= SUBMIT SCORE ================= */
const submitScore = async (req, res) => {
  try {
    const { teamName, round, score, round1, round2, round3 } = req.body;

    const user = await User.findOne({ teamName });

    if (!user) {
      return res.status(403).json({
        message: "User not registered"
      });
    }

    if (round === 1) user.round1Score = score;
    if (round === 2) user.round2Score = score;
    if (round === 3) user.round3Score = score;

    if (round === "final") {
      if (round1 !== undefined) user.round1Score = round1;
      if (round2 !== undefined) user.round2Score = round2;
      if (round3 !== undefined) user.round3Score = round3;
    }

    user.totalScore =
      user.round1Score +
      user.round2Score +
      user.round3Score;

    await user.save();

    res.json({
      success: true,
      message: "Score submitted successfully",
      totalScore: user.totalScore
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getLeaderboard,
  submitScore
};