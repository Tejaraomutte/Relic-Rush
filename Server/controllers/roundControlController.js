const RoundControl = require("../models/roundControl");

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
  const now = Date.now();
  let changed = false;

  roundControl.rounds = (roundControl.rounds || []).map((roundState) => {
    const endsAtTs = roundState?.endsAt ? new Date(roundState.endsAt).getTime() : 0;
    const hasExpired = roundState.status === "active" && endsAtTs > 0 && now >= endsAtTs;

    if (!hasExpired) {
      return roundState;
    }

    changed = true;
    return {
      ...roundState.toObject(),
      status: "completed"
    };
  });

  if (changed) {
    roundControl.markModified("rounds");
    await roundControl.save();
  }

  return roundControl;
};

const mapRoundState = (roundState) => {
  const now = Date.now();
  const startedAtTs = roundState?.startedAt ? new Date(roundState.startedAt).getTime() : null;
  const endsAtTs = roundState?.endsAt ? new Date(roundState.endsAt).getTime() : null;
  const isActive = roundState?.status === "active" && Boolean(endsAtTs) && now < endsAtTs;
  const timeRemainingSeconds = isActive
    ? Math.max(Math.ceil((endsAtTs - now) / 1000), 0)
    : 0;

  return {
    roundNumber: roundState.roundNumber,
    status: roundState.status,
    durationSeconds: Number(roundState.durationSeconds || DEFAULT_ROUND_DURATIONS[roundState.roundNumber] || 600),
    startedAt: roundState.startedAt,
    endsAt: roundState.endsAt,
    isStarted: Boolean(startedAtTs),
    isActive,
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
    const now = new Date();
    const endsAt = new Date(now.getTime() + (durationSeconds * 1000));

    roundControl.rounds = (roundControl.rounds || []).map((roundState) => {
      if (roundState.roundNumber < roundNumber && roundState.status === "waiting") {
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
        startedAt: now,
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
      startedAt: now,
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

module.exports = {
  getRoundStatuses,
  getRoundStatusByRound,
  startRound,
  resetRoundStatesToWaiting
};
