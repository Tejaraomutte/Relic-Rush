const RoundControl = require("../models/roundControl");
const PlayerRoundProgress = require("../models/playerRoundProgress");
const User = require("../models/user");

const DEFAULT_ROUND_DURATIONS = {
  1: 600,
  2: 1200,
  3: 900
};

const RESET_ROUND_STATE_ON_START = String(process.env.RESET_ROUND_STATE_ON_START || "true").toLowerCase() !== "false";
let hasRunStartupNormalization = false;

const buildWaitingRounds = () => ([1, 2, 3].map((roundNumber) => ({
  roundNumber,
  status: "waiting",
  durationSeconds: DEFAULT_ROUND_DURATIONS[roundNumber] || 600,
  startedAt: null,
  endsAt: null,
  startedBy: null
})));

const resetRoundStatesToWaiting = async () => {
  const existing = await RoundControl.findOne({ key: "global" });

  if (!existing) {
    const created = await RoundControl.create({
      key: "global",
      rounds: buildWaitingRounds()
    });
    hasRunStartupNormalization = true;
    return created;
  }

  existing.rounds = buildWaitingRounds();
  existing.markModified("rounds");
  await existing.save();

  hasRunStartupNormalization = true;
  return existing;
};

const toRoundNumber = (value) => {
  const parsed = Number(value);
  return [1, 2, 3].includes(parsed) ? parsed : null;
};

const toDuration = (value, fallback) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }
  return fallback;
};

const getOrCreateRoundControl = async () => {
  const existing = await RoundControl.findOne({ key: "global" });
  if (!existing) {
    const created = await RoundControl.create({ key: "global" });
    hasRunStartupNormalization = true;
    return created;
  }

  if (!hasRunStartupNormalization && RESET_ROUND_STATE_ON_START) {
    existing.rounds = buildWaitingRounds();
    existing.markModified("rounds");
    await existing.save();
  }

  hasRunStartupNormalization = true;
  return existing;
};

const refreshExpiredRounds = async (roundControl) => {
  if (!roundControl) return roundControl;

  let changed = false;
  const now = Date.now();

  roundControl.rounds = (roundControl.rounds || []).map((roundState) => {
    if (roundState.status !== "active") {
      return roundState;
    }

    const endsAtTs = roundState.endsAt ? new Date(roundState.endsAt).getTime() : null;
    if (endsAtTs && endsAtTs <= now) {
      changed = true;
      return {
        ...roundState.toObject(),
        status: "completed"
      };
    }

    return roundState;
  });

  if (changed) {
    roundControl.markModified("rounds");
    await roundControl.save();
  }

  return roundControl;
};

const getRoundState = (roundControl, roundNumber) =>
  (roundControl.rounds || []).find((entry) => entry.roundNumber === roundNumber);

const resolveRoundDuration = (roundState, roundNumber) =>
  Number(roundState?.durationSeconds || DEFAULT_ROUND_DURATIONS[roundNumber] || 600);

const syncUserRoundState = async ({ userId, roundNumber, roundStartTime, roundDurationSeconds, roundCompleted }) => {
  const user = await User.findById(userId);
  if (!user) return;

  const existing = Array.isArray(user.playerRoundState) ? user.playerRoundState : [];
  const idx = existing.findIndex((entry) => Number(entry.roundNumber) === Number(roundNumber));
  const nextEntry = {
    roundNumber,
    roundStartTime: roundStartTime || null,
    roundDurationSeconds: Number(roundDurationSeconds || 0),
    roundCompleted: Boolean(roundCompleted)
  };

  if (idx >= 0) {
    existing[idx] = nextEntry;
  } else {
    existing.push(nextEntry);
  }

  user.playerRoundState = existing;
  await user.save();
};

const computeRemainingTime = (startTime, duration) => {
  const safeDuration = Math.max(Number(duration) || 0, 0);
  const startedAtTs = startTime ? new Date(startTime).getTime() : Date.now();
  const elapsedSeconds = Math.max(Math.floor((Date.now() - startedAtTs) / 1000), 0);
  return Math.max(safeDuration - elapsedSeconds, 0);
};

const mapRoundState = (roundState) => {
  const isActive = roundState?.status === "active";
  const durationSeconds = Number(roundState.durationSeconds || DEFAULT_ROUND_DURATIONS[roundState.roundNumber] || 600);
  const startedAtTs = roundState.startedAt ? new Date(roundState.startedAt).getTime() : null;
  const endsAtTs = roundState.endsAt ? new Date(roundState.endsAt).getTime() : null;

  let timeRemainingSeconds = 0;
  if (isActive) {
    if (endsAtTs) {
      timeRemainingSeconds = Math.max(Math.ceil((endsAtTs - Date.now()) / 1000), 0);
    } else if (startedAtTs) {
      const elapsedSeconds = Math.max(Math.floor((Date.now() - startedAtTs) / 1000), 0);
      timeRemainingSeconds = Math.max(durationSeconds - elapsedSeconds, 0);
    } else {
      timeRemainingSeconds = durationSeconds;
    }
  }

  return {
    roundNumber: roundState.roundNumber,
    status: roundState.status,
    durationSeconds,
    startedAt: roundState.startedAt,
    endsAt: roundState.endsAt,
    isStarted: isActive,
    isActive: isActive && timeRemainingSeconds > 0,
    timeRemainingSeconds
  };
};

const getRoundStatuses = async (req, res) => {
  try {
    const roundControl = await refreshExpiredRounds(await getOrCreateRoundControl());
    const rounds = (roundControl.rounds || [])
      .sort((a, b) => a.roundNumber - b.roundNumber)
      .map(mapRoundState);

    return res.json({ rounds });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRoundStatusByRound = async (req, res) => {
  try {
    const roundNumber = toRoundNumber(req.params.round);
    if (!roundNumber) {
      return res.status(400).json({ message: "Invalid round number" });
    }

    const roundControl = await refreshExpiredRounds(await getOrCreateRoundControl());
    const roundState = (roundControl.rounds || []).find((entry) => entry.roundNumber === roundNumber);

    if (!roundState) {
      return res.status(404).json({ message: "Round state not found" });
    }

    return res.json({ round: mapRoundState(roundState) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const startRound = async (req, res) => {
  try {
    const roundNumber = toRoundNumber(req.params.round);
    if (!roundNumber) {
      return res.status(400).json({ message: "Invalid round number" });
    }

    const durationSeconds = toDuration(
      req.body?.durationSeconds,
      DEFAULT_ROUND_DURATIONS[roundNumber] || 600
    );

    const roundControl = await refreshExpiredRounds(await getOrCreateRoundControl());
    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + durationSeconds * 1000);

    roundControl.rounds = (roundControl.rounds || []).map((roundState) => {
      if (roundState.roundNumber < roundNumber && roundState.status === "waiting") {
        return {
          ...roundState.toObject(),
          status: "completed"
        };
      }

      if (roundState.roundNumber !== roundNumber && roundState.status === "active") {
        return {
          ...roundState.toObject(),
          status: "completed"
        };
      }

      if (roundState.roundNumber !== roundNumber) {
        return roundState;
      }

      return {
        ...roundState.toObject(),
        status: "active",
        durationSeconds,
        startedAt,
        endsAt,
        startedBy: req.user?._id || null
      };
    });

    roundControl.markModified("rounds");
    await roundControl.save();

    const payload = {
      roundNumber,
      status: "active",
      durationSeconds,
      startedAt,
      endsAt,
      timeRemainingSeconds: durationSeconds
    };

    const io = req.app.get("io");
    if (io) {
      io.emit("round:started", payload);
    }

    return res.json({
      success: true,
      message: `Round ${roundNumber} started`,
      round: payload
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getOrCreatePlayerRoundProgress = async (req, res) => {
  try {
    const roundNumber = toRoundNumber(req.params.round);
    if (!roundNumber) {
      return res.status(400).json({ message: "Invalid round number" });
    }

    const roundControl = await refreshExpiredRounds(await getOrCreateRoundControl());
    const roundState = getRoundState(roundControl, roundNumber);

    if (!roundState || roundState.status !== "active") {
      return res.status(409).json({ message: "Round is not active" });
    }

    let progress = await PlayerRoundProgress.findOne({
      userId: req.user._id,
      roundId: roundNumber
    });

    if (!progress) {
      progress = await PlayerRoundProgress.create({
        userId: req.user._id,
        roundId: roundNumber,
        startTime: new Date(),
        duration: resolveRoundDuration(roundState, roundNumber),
        completed: false,
        score: 0
      });

      await syncUserRoundState({
        userId: req.user._id,
        roundNumber,
        roundStartTime: progress.startTime,
        roundDurationSeconds: progress.duration,
        roundCompleted: progress.completed
      });
    }

    const remainingTime = computeRemainingTime(progress.startTime, progress.duration);

    return res.json({
      progress: {
        userId: req.user._id,
        roundId: progress.roundId,
        startTime: progress.startTime,
        duration: progress.duration,
        completed: progress.completed,
        score: progress.score,
        remainingTime
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPlayerRoundProgress = async (req, res) => {
  try {
    const roundNumber = toRoundNumber(req.params.round);
    if (!roundNumber) {
      return res.status(400).json({ message: "Invalid round number" });
    }

    const progress = await PlayerRoundProgress.findOne({
      userId: req.user._id,
      roundId: roundNumber
    });

    if (!progress) {
      return res.status(404).json({ message: "Round progress not found" });
    }

    const remainingTime = computeRemainingTime(progress.startTime, progress.duration);

    return res.json({
      progress: {
        userId: req.user._id,
        roundId: progress.roundId,
        startTime: progress.startTime,
        duration: progress.duration,
        completed: progress.completed,
        score: progress.score,
        remainingTime
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const completePlayerRound = async (req, res) => {
  try {
    const roundNumber = toRoundNumber(req.params.round);
    if (!roundNumber) {
      return res.status(400).json({ message: "Invalid round number" });
    }

    const parsedScore = Number(req.body?.score);
    const hasScore = Number.isFinite(parsedScore);

    const roundControl = await getOrCreateRoundControl();
    const roundState = getRoundState(roundControl, roundNumber);
    const fallbackDuration = resolveRoundDuration(roundState, roundNumber);

    const update = {
      completed: true
    };

    if (hasScore) {
      update.score = parsedScore;
    }

    const progress = await PlayerRoundProgress.findOneAndUpdate(
      { userId: req.user._id, roundId: roundNumber },
      {
        $set: update,
        $setOnInsert: {
          userId: req.user._id,
          roundId: roundNumber,
          startTime: new Date(),
          duration: fallbackDuration
        }
      },
      { new: true, upsert: true }
    );

    const remainingTime = computeRemainingTime(progress.startTime, progress.duration);

    await syncUserRoundState({
      userId: req.user._id,
      roundNumber,
      roundStartTime: progress.startTime,
      roundDurationSeconds: progress.duration,
      roundCompleted: progress.completed
    });

    return res.json({
      success: true,
      progress: {
        userId: req.user._id,
        roundId: progress.roundId,
        startTime: progress.startTime,
        duration: progress.duration,
        completed: progress.completed,
        score: progress.score,
        remainingTime
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRoundStatuses,
  getRoundStatusByRound,
  startRound,
  getOrCreatePlayerRoundProgress,
  getPlayerRoundProgress,
  completePlayerRound,
  resetRoundStatesToWaiting
};
