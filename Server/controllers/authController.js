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

const buildLoginSummary = (user) => {
  const rounds = Array.isArray(user.rounds) ? user.rounds : [];
  const getRoundScore = (roundNumber) => {
    const round = rounds.find((entry) => entry.roundNumber === roundNumber);
    return toNumber(round?.roundScore, 0);
  };

  const round1Score = getRoundScore(1);
  const round2Score = getRoundScore(2);
  const round3Score = getRoundScore(3);

  return {
    teamName: user.teamName,
    isLoggedIn: true,
    rounds: {
      round1Played: round1Score > 0,
      round2Played: round2Score > 0,
      round3Played: round3Score > 0
    },
    scores: {
      round1: round1Score,
      round2: round2Score,
      round3: round3Score
    },
    totalScore: toNumber(user.totalScore, round1Score + round2Score + round3Score)
  };
};
const isLoggedIn = (req) => Boolean(req && req.user && req.user.teamName);

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

    // One-time login enforcement: only for participants, admins can login multiple times
    if (userRole === "participant" && user.isLoggedIn) {
      return res.status(403).json({
        message: "Login already used. Only one login allowed."
      });
    }

    // Set isLoggedIn flag for participants (admins don't need this flag)
    if (userRole === "participant" && !user.isLoggedIn) {
      user.isLoggedIn = true;
      await user.save();
    }

    res.json({
      ...buildLoginSummary(user),
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
          timeTaken: "$totalCompletionTime",
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

/* ================= PUBLIC LEADERBOARD ================= */
const getPublicLeaderboard = async (req, res) => {
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
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          teamName: 1,
          totalScore: { $ifNull: ["$totalScore", 0] }
        }
      }
    ]);

    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));

    return res.json({ leaderboard: rankedLeaderboard });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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

    if (!isLoggedIn(req)) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const authenticatedTeamName = normalizeTeamName(req.user.teamName || "");
    const requestedTeamName = normalizeTeamName(teamName);

    if (requestedTeamName && requestedTeamName.toLowerCase() !== authenticatedTeamName.toLowerCase()) {
      return res.status(403).json({ message: "Team mismatch" });
    }

    const safeTeamName = authenticatedTeamName || requestedTeamName;

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

    const upsertFinalRoundScore = (roundNumber, roundScore) => {
      const existingIndex = (user.rounds || []).findIndex(
        (item) => item.roundNumber === roundNumber
      );

      if (existingIndex >= 0) {
        const existingRound = user.rounds[existingIndex];
        user.rounds[existingIndex] = {
          ...existingRound.toObject(),
          roundScore: toNumber(roundScore, existingRound.roundScore || 0)
        };
      } else {
        user.rounds.push(buildRoundPayload({
          roundNumber,
          score: roundScore,
          questionsSolved: 0,
          questionTimes: [],
          totalRoundTime: 0
        }));
      }
    };

    if (round === "final") {
      if (round1 !== undefined) {
        upsertFinalRoundScore(1, round1);
      }
      if (round2 !== undefined) {
        upsertFinalRoundScore(2, round2);
      }
      if (round3 !== undefined) {
        upsertFinalRoundScore(3, round3);
      }
    } else {
      const numericRound = Number(round);
      if (![1, 2, 3].includes(numericRound)) {
        return res.status(400).json({ message: "Invalid round number" });
      }

      if (numericRound === 1) {
        user.rounds = (user.rounds || []).filter((item) => item.roundNumber !== 2 && item.roundNumber !== 3);
      }

      if (numericRound === 2) {
        user.rounds = (user.rounds || []).filter((item) => item.roundNumber !== 3);
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
  getPublicLeaderboard,
  submitScore
};