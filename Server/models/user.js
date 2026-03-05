const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  questionsSolved: { type: Number, default: 0 },
  questionTimes: [{ type: Number }],
  totalRoundTime: { type: Number, default: 0 },
  roundScore: { type: Number, default: 0 }
}, { _id: false });

const playerRoundStateSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true, min: 1, max: 3 },
  roundStartTime: { type: Date, default: null },
  roundDurationSeconds: { type: Number, default: 0, min: 0 },
  roundCompleted: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true, trim: true },
  player1Name: { type: String, trim: true, default: "" },
  player2Name: { type: String, trim: true, default: null },
  teamMembers: {
    type: [String],
    default: [],
    set: (members) => Array.isArray(members)
      ? members.map((member) => String(member || "").trim()).filter(Boolean)
      : []
  },
  role: { type: String, enum: ["admin", "participant"], default: "participant" },
  password: { type: String, required: true },
  isLoggedIn: { type: Boolean, default: false },
  currentRound: { type: Number, default: 1, min: 1, max: 3 },
  rounds: {
    type: [roundSchema],
    default: []
  },
  playerRoundState: {
    type: [playerRoundStateSchema],
    default: []
  },
  roundsPlayed: {
    round1Played: { type: Boolean, default: false },
    round2Played: { type: Boolean, default: false },
    round3Played: { type: Boolean, default: false }
  },
  scores: {
    round1: { type: Number, default: 0 },
    round2: { type: Number, default: 0 },
    round3: { type: Number, default: 0 }
  },
  totalScore: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
  round1Score: { type: Number, default: 0 },
  round1Time: { type: Number, default: 0 },
  round2Score: { type: Number, default: 0 },
  round2Time: { type: Number, default: 0 },
  round3Score: { type: Number, default: 0 },
  round3Time: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.pre("save", function updateTotalScore() {
  const rounds = Array.isArray(this.rounds) ? this.rounds : [];
  const getRound = (roundNumber) => rounds.find((round) => round.roundNumber === roundNumber);
  const getScore = (roundNumber) => {
    const round = getRound(roundNumber);
    return Number(round?.roundScore || 0);
  };
  const getRoundTime = (roundNumber) => {
    const round = getRound(roundNumber);
    return Number(round?.totalRoundTime || 0);
  };

  const round1Score = getScore(1);
  const round2Score = getScore(2);
  const round3Score = getScore(3);
  const round1Time = getRoundTime(1);
  const round2Time = getRoundTime(2);
  const round3Time = getRoundTime(3);

  this.scores = {
    round1: round1Score,
    round2: round2Score,
    round3: round3Score
  };

  this.roundsPlayed = {
    round1Played: Boolean(getRound(1)),
    round2Played: Boolean(getRound(2)),
    round3Played: Boolean(getRound(3))
  };

  this.round1Score = round1Score;
  this.round2Score = round2Score;
  this.round3Score = round3Score;
  this.round1Time = round1Time;
  this.round2Time = round2Time;
  this.round3Time = round3Time;

  this.totalScore = round1Score + round2Score + round3Score;
  this.totalTime = round1Time + round2Time + round3Time;
});

module.exports = mongoose.model("User", userSchema);
