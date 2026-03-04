const User = require("../models/user");
const jwt = require("jsonwebtoken");

/* ================= TOKEN ================= */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });
};

const normalizeTeamName = (value = "") => value.trim();
const normalizeOptionalName = (value = "") => {
  const normalized = String(value || "").trim();
  return normalized || null;
};
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const parseBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  return fallback;
};

const clampRound = (value) => {
  const parsed = toNumber(value, 1);
  return Math.min(3, Math.max(1, parsed));
};

const getRoundSnapshot = (user, roundNumber) => {
  const rounds = Array.isArray(user?.rounds) ? user.rounds : [];
  const existingRound = rounds.find((entry) => entry.roundNumber === roundNumber);

  const flatScoreKey = roundNumber === 1
    ? "round1Score"
    : roundNumber === 2
      ? "round2Score"
      : "round3Score";

  const flatTimeKey = roundNumber === 1
    ? "round1Time"
    : roundNumber === 2
      ? "round2Time"
      : "round3Time";

  const score = toNumber(existingRound?.roundScore, toNumber(user?.[flatScoreKey], 0));
  const time = toNumber(existingRound?.totalRoundTime, toNumber(user?.[flatTimeKey], 0));

  return {
    roundNumber,
    score,
    time,
    canStart: score === 0 && time === 0,
    isCompleted: score !== 0 || time !== 0
  };
};

const resolveRoundAccess = (user) => {
  const storedCurrentRound = clampRound(user?.currentRound);

  const rounds = {
    round1: getRoundSnapshot(user, 1),
    round2: getRoundSnapshot(user, 2),
    round3: getRoundSnapshot(user, 3)
  };

  const orderedRounds = [rounds.round1, rounds.round2, rounds.round3];

  const firstStartableRound = orderedRounds.find((snapshot) => snapshot.canStart);
  if (firstStartableRound) {
    return {
      currentRound: storedCurrentRound,
      nextRound: firstStartableRound.roundNumber,
      eventCompleted: false,
      rounds
    };
  }

  return {
    currentRound: storedCurrentRound,
    nextRound: 3,
    eventCompleted: true,
    rounds
  };
};

const buildLoginSummary = (user) => {
  const rounds = Array.isArray(user.rounds) ? user.rounds : [];
  const getRoundScore = (roundNumber) => {
    const round = rounds.find((entry) => entry.roundNumber === roundNumber);
    return toNumber(round?.roundScore, 0);
  };
  const getRoundTime = (roundNumber) => {
    const round = rounds.find((entry) => entry.roundNumber === roundNumber);
    return toNumber(round?.totalRoundTime, 0);
  };

  const round1Score = getRoundScore(1);
  const round2Score = getRoundScore(2);
  const round3Score = getRoundScore(3);
  const round1Time = getRoundTime(1);
  const round2Time = getRoundTime(2);
  const round3Time = getRoundTime(3);

  return {
    _id: user._id,
    teamName: user.teamName,
    currentRound: clampRound(user.currentRound),
    isLoggedIn: true,
    rounds: {
      round1Played: round1Score !== 0 || round1Time !== 0,
      round2Played: round2Score !== 0 || round2Time !== 0,
      round3Played: round3Score !== 0 || round3Time !== 0
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
    const { teamName, password, role, adminRegistrationKey } = req.body;
    const safeTeamName = normalizeTeamName(teamName);

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
    const roundAccess = resolveRoundAccess(user);
    const effectiveCurrentRound = roundAccess.eventCompleted ? 3 : roundAccess.nextRound;

    // One-time login enforcement: only for participants, admins can login multiple times
    if (userRole === "participant" && user.isLoggedIn) {
      return res.status(403).json({
        message: "Login already used. Only one login allowed."
      });
    }

    // Set isLoggedIn and normalize currentRound for participants (admins don't need this flag)
    if (userRole === "participant") {
      let shouldSave = false;

      if (!user.isLoggedIn) {
        user.isLoggedIn = true;
        shouldSave = true;
      }

      if (toNumber(user.currentRound, 1) !== effectiveCurrentRound) {
        user.currentRound = effectiveCurrentRound;
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save();
      }
    }

    res.json({
      ...buildLoginSummary(user),
      currentRound: effectiveCurrentRound,
      eventCompleted: roundAccess.eventCompleted,
      roundAccess,
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
          _id: 1,
          teamName: 1,
          player1Name: { $ifNull: ["$player1Name", ""] },
          player2Name: { $ifNull: ["$player2Name", null] },
          teamMembers: { $ifNull: ["$teamMembers", []] },
          isLoggedIn: { $ifNull: ["$isLoggedIn", false] },
          currentRound: { $ifNull: ["$currentRound", 1] },
          totalScore: { $ifNull: ["$totalScore", 0] },
          totalCompletionTime: 1,
          totalTime: { $ifNull: ["$totalTime", "$totalCompletionTime"] },
          timeTaken: "$totalCompletionTime",
          round1Score: { $ifNull: ["$round1Score", 0] },
          round1Time: { $ifNull: ["$round1Time", 0] },
          round2Score: { $ifNull: ["$round2Score", 0] },
          round2Time: { $ifNull: ["$round2Time", 0] },
          round3Score: { $ifNull: ["$round3Score", 0] },
          round3Time: { $ifNull: ["$round3Time", 0] },
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

/* ================= ADMIN CREATE TEAM ================= */
const createTeamByAdmin = async (req, res) => {
  try {
    const {
      teamName,
      player1Name,
      player2Name,
      teamMembers,
      password
    } = req.body;

    const safeTeamName = normalizeTeamName(teamName);
    const safePlayer1Name = normalizeTeamName(player1Name);
    const safePlayer2Name = normalizeOptionalName(player2Name);
    const normalizedTeamMembers = Array.isArray(teamMembers)
      ? teamMembers.map((entry) => normalizeTeamName(entry)).filter(Boolean)
      : String(teamMembers || "")
          .split(",")
          .map((entry) => normalizeTeamName(entry))
          .filter(Boolean);

    const mergedTeamMembers = Array.from(new Set([
      safePlayer1Name,
      safePlayer2Name,
      ...normalizedTeamMembers
    ].filter(Boolean)));
    const safePassword = String(password || "").trim();

    if (!safeTeamName || !safePlayer1Name || !safePassword) {
      return res.status(400).json({
        message: "teamName, player1Name and password are required"
      });
    }

    const existingTeam = await User.findOne({
      teamName: {
        $regex: `^${safeTeamName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i"
      }
    });

    if (existingTeam) {
      return res.status(400).json({ message: "Team already exists" });
    }

    const createdTeam = await User.create({
      teamName: safeTeamName,
      player1Name: safePlayer1Name,
      player2Name: safePlayer2Name,
      teamMembers: mergedTeamMembers,
      password: safePassword,
      role: "participant",
      isLoggedIn: false,
      rounds: [],
      totalScore: 0,
      totalTime: 0,
      round1Score: 0,
      round1Time: 0,
      round2Score: 0,
      round2Time: 0,
      round3Score: 0,
      round3Time: 0
    });

    return res.status(201).json({
      message: "Team created successfully",
      team: {
        _id: createdTeam._id,
        teamName: createdTeam.teamName,
        player1Name: createdTeam.player1Name,
        player2Name: createdTeam.player2Name,
        teamMembers: createdTeam.teamMembers,
        totalScore: createdTeam.totalScore,
        totalTime: createdTeam.totalTime,
        round1Score: createdTeam.round1Score,
        round1Time: createdTeam.round1Time,
        round2Score: createdTeam.round2Score,
        round2Time: createdTeam.round2Time,
        round3Score: createdTeam.round3Score,
        round3Time: createdTeam.round3Time
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ================= ADMIN UPDATE TEAM ================= */
const updateTeamByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      teamName,
      player1Name,
      player2Name,
      password,
      round1Score,
      round1Time,
      round2Score,
      round2Time,
      round3Score,
      round3Time,
      totalScore,
      totalTime,
      isLoggedIn,
      currentRound
    } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== "participant") {
      return res.status(404).json({ message: "Team not found" });
    }

    const safeTeamName = normalizeTeamName(teamName);
    const safePlayer1Name = normalizeTeamName(player1Name);
    const safePlayer2Name = normalizeOptionalName(player2Name);
    const safePassword = String(password || "").trim();

    if (!safeTeamName || !safePlayer1Name) {
      return res.status(400).json({ message: "teamName and player1Name are required" });
    }

    if (safeTeamName.toLowerCase() !== String(user.teamName || "").toLowerCase()) {
      const existingTeam = await User.findOne({
        _id: { $ne: user._id },
        teamName: {
          $regex: `^${safeTeamName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i"
        }
      });
      if (existingTeam) {
        return res.status(400).json({ message: "Team already exists" });
      }
    }

    user.teamName = safeTeamName;
    user.player1Name = safePlayer1Name;
    user.player2Name = safePlayer2Name;
    user.teamMembers = Array.from(new Set([safePlayer1Name, safePlayer2Name].filter(Boolean)));
    user.isLoggedIn = parseBoolean(isLoggedIn, Boolean(user.isLoggedIn));
    user.currentRound = Math.min(3, Math.max(1, toNumber(currentRound, toNumber(user.currentRound, 1))));

    if (safePassword) {
      user.password = safePassword;
    }

    const getExistingRound = (roundNumber) => (user.rounds || []).find((entry) => entry.roundNumber === roundNumber);
    const nextRounds = [1, 2, 3]
      .map((roundNumber) => {
        const existingRound = getExistingRound(roundNumber);
        const scoreInput = roundNumber === 1 ? round1Score : roundNumber === 2 ? round2Score : round3Score;
        const timeInput = roundNumber === 1 ? round1Time : roundNumber === 2 ? round2Time : round3Time;

        const nextScore = scoreInput !== undefined
          ? Math.max(0, toNumber(scoreInput, 0))
          : toNumber(existingRound?.roundScore, 0);

        const nextTime = timeInput !== undefined
          ? Math.max(0, toNumber(timeInput, 0))
          : toNumber(existingRound?.totalRoundTime, 0);

        if (nextScore <= 0 && nextTime <= 0 && !existingRound) {
          return null;
        }

        return {
          roundNumber,
          questionsSolved: toNumber(existingRound?.questionsSolved, 0),
          questionTimes: Array.isArray(existingRound?.questionTimes) ? existingRound.questionTimes : [],
          totalRoundTime: nextTime,
          roundScore: nextScore
        };
      })
      .filter(Boolean);

    user.rounds = nextRounds;
    user.markModified("rounds");
    await user.save();

    return res.json({
      message: "Team updated successfully",
      team: {
        _id: user._id,
        teamName: user.teamName,
        player1Name: user.player1Name,
        player2Name: user.player2Name,
        isLoggedIn: user.isLoggedIn,
        currentRound: user.currentRound,
        round1Score: user.round1Score,
        round1Time: user.round1Time,
        round2Score: user.round2Score,
        round2Time: user.round2Time,
        round3Score: user.round3Score,
        round3Time: user.round3Time,
        totalScore: user.totalScore,
        totalTime: user.totalTime
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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

    const MAX_SAVE_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_SAVE_RETRIES; attempt += 1) {
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

        user.currentRound = 3;
      } else {
        const numericRound = Number(round);
        if (![1, 2, 3].includes(numericRound)) {
          return res.status(400).json({ message: "Invalid round number" });
        }

        const roundAccess = resolveRoundAccess(user);
        if (roundAccess.eventCompleted) {
          return res.status(409).json({
            message: "Event already completed. Round submission is not allowed."
          });
        }

        if (numericRound !== roundAccess.nextRound) {
          return res.status(409).json({
            message: `Invalid round submission. Expected round ${roundAccess.nextRound}.`,
            expectedRound: roundAccess.nextRound
          });
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

        if (numericRound === 1) {
          user.currentRound = 2;
        } else if (numericRound === 2) {
          user.currentRound = 3;
        } else {
          user.currentRound = 3;
        }
      }

      user.rounds.sort((a, b) => a.roundNumber - b.roundNumber);
      user.markModified("rounds");

      try {
        await user.save();
      } catch (saveError) {
        if (saveError?.name === "VersionError" && attempt < MAX_SAVE_RETRIES) {
          continue;
        }
        throw saveError;
      }

      return res.json({
        success: true,
        message: "Score submitted successfully",
        totalScore: user.totalScore,
        rounds: user.rounds
      });
    }

    return res.status(409).json({
      message: "Concurrent update detected. Please retry submission."
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
  createTeamByAdmin,
  updateTeamByAdmin,
  getPublicLeaderboard,
  submitScore
};