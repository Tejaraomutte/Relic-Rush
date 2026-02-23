const User = require("../models/user");
const jwt = require("jsonwebtoken");

/* ================= TOKEN ================= */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });
};

const normalizeTeamName = (value = "") => value.trim();
const normalizeEmail = (value = "") => value.trim().toLowerCase();
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildRoundPayload = ({ roundNumber, score, questionsSolved, questionTimes, totalRoundTime }) => {
  const safeQuestionTimes = Array.isArray(questionTimes)
    ? questionTimes.map((entry) => toNumber(entry, 0)).filter((entry) => entry >= 0)
    : [];

  return {
    roundNumber,
    roundScore: toNumber(score, 0),
    questionsSolved: toNumber(questionsSolved, 0),
    questionTimes: safeQuestionTimes,
    totalRoundTime: totalRoundTime !== undefined
      ? toNumber(totalRoundTime, 0)
      : safeQuestionTimes.reduce((sum, item) => sum + item, 0)
  };
};

/* ================= REGISTER ================= */
const registerUser = async (req, res) => {
  try {
    const { teamName, email, password, role, adminRegistrationKey } = req.body;
    const safeTeamName = normalizeTeamName(teamName);
    const safeEmail = email ? normalizeEmail(email) : null;

    if (!safeTeamName || !password) {
      return res.status(400).json({
        message: "teamName and password are required"
      });
    }

    const requestedRole = role === "admin" ? "admin" : "participant";
    const adminKeyConfigured = Boolean(process.env.ADMIN_REGISTRATION_KEY);
    if (
      requestedRole === "admin" &&
      adminKeyConfigured &&
      adminRegistrationKey !== process.env.ADMIN_REGISTRATION_KEY
    ) {
      return res.status(403).json({
        message: "Admin registration is not allowed"
      });
    }

    const userExists = await User.findOne({ teamName: safeTeamName });

    if (userExists) {
      return res.status(400).json({
        message: "Team already exists"
      });
    }

    const user = await User.create({
      teamName: safeTeamName,
      email: safeEmail,
      role: requestedRole,
      password,
      rounds: []
    });

    res.status(201).json({
      _id: user._id,
      teamName: user.teamName,
      token: generateToken(user._id, user.role)
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
    const teamName = normalizeTeamName(req.body.teamName);
    const password = (req.body.password || "").trim();

    const user = await User.findOne({
      teamName: { $regex: `^${teamName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const userRole = user.role || "participant";

    res.json({
      teamName: user.teamName,
      token: generateToken(user._id, userRole),
      role: userRole
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= ADMIN LEADERBOARD ================= */
const getAdminLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.aggregate([
      {
        $match: { role: "participant" }
      },
      {
        $addFields: {
          totalCompletionTime: {
            $sum: {
              $map: {
                input: "$rounds",
                as: "round",
                in: { $ifNull: ["$$round.totalRoundTime", 0] }
              }
            }
          }
        }
      },
      {
        $sort: {
          totalScore: -1,
          totalCompletionTime: 1,
          teamName: 1
        }
      },
      {
        $project: {
          _id: 0,
          teamName: 1,
          totalScore: { $ifNull: ["$totalScore", 0] },
          totalCompletionTime: 1,
          rounds: {
            $map: {
              input: "$rounds",
              as: "round",
              in: {
                roundNumber: "$$round.roundNumber",
                questionsSolved: { $ifNull: ["$$round.questionsSolved", 0] },
                totalRoundTime: { $ifNull: ["$$round.totalRoundTime", 0] },
                roundScore: { $ifNull: ["$$round.roundScore", 0] }
              }
            }
          }
        }
      }
    ]);

    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));

    return res.json(rankedLeaderboard);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* ================= SUBMIT SCORE ================= */
const submitScore = async (req, res) => {
  try {
    const {
      teamName,
      round,
      score,
      round1,
      round2,
      round3,
      questionsSolved,
      questionTimes,
      totalRoundTime
    } = req.body;

    const safeTeamName = normalizeTeamName(teamName);

    const user = await User.findOne({ teamName: safeTeamName });

    if (!user) {
      return res.status(403).json({
        message: "User not registered"
      });
    }

    const upsertRound = (roundPayload) => {
      const existingIndex = (user.rounds || []).findIndex(
        (item) => item.roundNumber === roundPayload.roundNumber
      );

      if (existingIndex >= 0) {
        user.rounds[existingIndex] = {
          ...user.rounds[existingIndex].toObject(),
          ...roundPayload
        };
      } else {
        user.rounds.push(roundPayload);
      }
    };

    if (round === "final") {
      if (round1 !== undefined) {
        upsertRound(buildRoundPayload({ roundNumber: 1, score: round1 }));
      }
      if (round2 !== undefined) {
        upsertRound(buildRoundPayload({ roundNumber: 2, score: round2 }));
      }
      if (round3 !== undefined) {
        upsertRound(buildRoundPayload({ roundNumber: 3, score: round3 }));
      }
    } else {
      const numericRound = Number(round);
      if (![1, 2, 3].includes(numericRound)) {
        return res.status(400).json({ message: "Invalid round number" });
      }

      upsertRound(buildRoundPayload({
        roundNumber: numericRound,
        score,
        questionsSolved,
        questionTimes,
        totalRoundTime
      }));
    }

    user.rounds.sort((a, b) => a.roundNumber - b.roundNumber);
    user.markModified("rounds");
    await user.save();

    res.json({
      success: true,
      message: "Score submitted successfully",
      totalScore: user.totalScore,
      rounds: user.rounds
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
  getAdminLeaderboard,
  submitScore
};